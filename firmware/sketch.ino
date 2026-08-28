// Blue Brilliant — Peixonautas
// ESP32: sonar, GPS, SD, pH/turb/TDS/OD, bomba eDNA

#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <TinyGPS++.h>
#include <SD.h>
#include <SPI.h>

// credenciais — trocar pelos reais
const char* WIFI_SSID     = "Wokwi-GUEST";
const char* WIFI_PASS     = "";
const char* AIO_USERNAME  = "SEU_USUARIO_ADAFRUIT";
const char* AIO_KEY       = "SUA_CHAVE_ADAFRUIT";
const char* AIO_GROUP     = "boia";

const float    RAIO_PERIMETRO_CM          = 60.0f;
const int      NUM_AMOSTRAS_SONAR         = 5;
const unsigned long INTERVALO_CICLO_MS    = 3000UL;
const unsigned long INTERVALO_EDNA_MS     = 60000UL;
const unsigned long DURACAO_BOMBA_MS      = 5000UL;
const unsigned long TIMEOUT_WIFI_MS       = 10000UL;
const unsigned long TIMEOUT_ECHO_US       = 30000UL;

const int PIN_TRIG      = 25;
const int PIN_ECHO      = 26;
const int PIN_LED       = 27;
const int PIN_BUZZER    = 14;
const int PIN_SD_CS     = 5;
const int PIN_ONEWIRE   = 4;
const int PIN_PH        = 34;
const int PIN_TURBIDEZ  = 35;
const int PIN_TDS       = 32;
const int PIN_OD        = 33;
const int PIN_BOMBA     = 13;

OneWire           oneWire(PIN_ONEWIRE);
DallasTemperature sensorTemp(&oneWire);
TinyGPSPlus       gps;
HardwareSerial    SerialGPS(2);

bool          sdDisponivel        = false;
unsigned long ultimaAmostragemMs  = 0;
int           contadorAmostrasEDNA = 0;
bool          wifiOk              = false;

void conectarWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print(F("WiFi"));
  unsigned long inicio = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - inicio < TIMEOUT_WIFI_MS) {
    delay(250);
    Serial.print('.');
  }
  wifiOk = (WiFi.status() == WL_CONNECTED);
  Serial.println(wifiOk ? F(" ok") : F(" offline"));
}

float medirDistanciaCM() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  long duracao = pulseIn(PIN_ECHO, HIGH, TIMEOUT_ECHO_US);
  if (duracao == 0) return -1.0f;
  return (duracao * 0.0343f) / 2.0f;
}

float mediaSonar() {
  float soma = 0;
  int validas = 0;
  for (int i = 0; i < NUM_AMOSTRAS_SONAR; i++) {
    float d = medirDistanciaCM();
    if (d > 0 && d < 400) {
      soma += d;
      validas++;
    }
    delay(30);
  }
  if (validas == 0) return -1.0f;
  return soma / validas;
}

float lerAnalogicoNormalizado(int pino) {
  long soma = 0;
  for (int i = 0; i < 8; i++) {
    soma += analogRead(pino);
    delay(2);
  }
  return soma / 8.0f;
}

// calibracoes aproximadas para prototipo
float lerPH() {
  float v = lerAnalogicoNormalizado(PIN_PH) * (3.3f / 4095.0f);
  return constrain(7.0f + (2.5f - v) * 3.5f, 0.0f, 14.0f);
}

float lerTurbidez() {
  float v = lerAnalogicoNormalizado(PIN_TURBIDEZ) * (3.3f / 4095.0f);
  return constrain(v * 100.0f, 0.0f, 300.0f);
}

float lerTDS() {
  float v = lerAnalogicoNormalizado(PIN_TDS) * (3.3f / 4095.0f);
  return constrain(v * 500.0f, 0.0f, 1000.0f);
}

float lerOD() {
  float v = lerAnalogicoNormalizado(PIN_OD) * (3.3f / 4095.0f);
  return constrain(v * 15.0f, 0.0f, 20.0f);
}

float lerTemperatura() {
  sensorTemp.requestTemperatures();
  float t = sensorTemp.getTempCByIndex(0);
  if (t == DEVICE_DISCONNECTED_C) return NAN;
  return t;
}

void atualizarGPS() {
  while (SerialGPS.available() > 0) {
    gps.encode(SerialGPS.read());
  }
}

void gravarSD(float dist, float temp, float ph, float turb, float tds, float od,
              double lat, double lng, bool alerta, int amostras) {
  if (!sdDisponivel) return;
  File f = SD.open("/log.csv", FILE_APPEND);
  if (!f) return;
  f.printf("%lu,%.1f,%.2f,%.2f,%.1f,%.1f,%.2f,%.5f,%.5f,%d,%d\n",
           millis(), dist, temp, ph, turb, tds, od, lat, lng, alerta ? 1 : 0, amostras);
  f.close();
}

void enviarTelemetria(float dist, float temp, float ph, float turb, float tds, float od,
                      double lat, double lng, bool alerta, int amostras) {
  if (!wifiOk) return;
  HTTPClient http;
  String url = String("https://io.adafruit.com/api/v2/") + AIO_USERNAME +
               "/groups/" + AIO_GROUP + "/data";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-AIO-Key", AIO_KEY);
  String body = "{\"feeds\":{";
  body += "\"distancia\":" + String(dist, 1) + ",";
  body += "\"temperatura\":" + String(temp, 2) + ",";
  body += "\"ph\":" + String(ph, 2) + ",";
  body += "\"turbidez\":" + String(turb, 1) + ",";
  body += "\"tds\":" + String(tds, 1) + ",";
  body += "\"od\":" + String(od, 2) + ",";
  body += "\"alerta\":" + String(alerta ? 1 : 0) + ",";
  body += "\"amostras\":" + String(amostras);
  body += "}}";
  http.POST(body);
  http.end();
}

void acionarBomba() {
  digitalWrite(PIN_BOMBA, HIGH);
  Serial.println(F("bomba eDNA ON"));
  delay(DURACAO_BOMBA_MS);
  digitalWrite(PIN_BOMBA, LOW);
  contadorAmostrasEDNA++;
  ultimaAmostragemMs = millis();
  Serial.printf("amostra #%d pronta\n", contadorAmostrasEDNA);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_BOMBA, OUTPUT);
  digitalWrite(PIN_BOMBA, LOW);
  digitalWrite(PIN_LED, LOW);
  digitalWrite(PIN_BUZZER, LOW);

  sensorTemp.begin();
  SerialGPS.begin(9600, SERIAL_8N1, 16, 17);

  if (SD.begin(PIN_SD_CS)) {
    sdDisponivel = true;
    if (!SD.exists("/log.csv")) {
      File f = SD.open("/log.csv", FILE_WRITE);
      if (f) {
        f.println("ms,dist,temp,ph,turb,tds,od,lat,lng,alerta,amostras");
        f.close();
      }
    }
  }

  conectarWiFi();
  ultimaAmostragemMs = millis();
  Serial.println(F("Blue Brilliant — Peixonautas ready"));
}

void loop() {
  atualizarGPS();

  float distancia = mediaSonar();
  float tempAgua  = lerTemperatura();
  float ph        = lerPH();
  float turbidez  = lerTurbidez();
  float tds       = lerTDS();
  float od        = lerOD();

  bool alerta = (distancia > 0 && distancia < RAIO_PERIMETRO_CM);
  digitalWrite(PIN_LED, alerta ? HIGH : LOW);
  digitalWrite(PIN_BUZZER, alerta ? HIGH : LOW);

  if (millis() - ultimaAmostragemMs >= INTERVALO_EDNA_MS) {
    acionarBomba();
  }

  double lat = gps.location.isValid() ? gps.location.lat() : 0.0;
  double lng = gps.location.isValid() ? gps.location.lng() : 0.0;

  Serial.printf("d=%.1f ph=%.2f turb=%.1f tds=%.0f od=%.1f T=%.1f alerta=%d\n",
                distancia, ph, turbidez, tds, od, tempAgua, alerta);

  gravarSD(distancia, tempAgua, ph, turbidez, tds, od, lat, lng, alerta, contadorAmostrasEDNA);
  enviarTelemetria(distancia, tempAgua, ph, turbidez, tds, od, lat, lng, alerta, contadorAmostrasEDNA);

  delay(INTERVALO_CICLO_MS);
}
