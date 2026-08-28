'use client';

import clsx from 'clsx';

type Props = {
  dist: number;
  ph: number;
  turb: number;
  tds: number;
  od: number;
  temp: number;
  alert: boolean;
  pumping: boolean;
  amostras: number;
};

export default function LiveCode({
  dist, ph, turb, tds, od, temp, alert, pumping, amostras,
}: Props) {
  const status = alert ? 'ALERT' : pumping ? 'eDNA' : 'RUN';
  const d = Number(dist);
  const phS = ph.toFixed(2);
  const turbS = Math.round(turb);
  const tdsS = Math.round(tds);
  const odS = od.toFixed(1);
  const tempS = temp.toFixed(1);

  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0f14] overflow-hidden font-mono text-[11px] leading-[1.55]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/[0.03] sticky top-0 z-10">
        <span className="text-white/40">firmware/sketch.ino · live</span>
        <span
          className={clsx(
            'text-[10px] px-2 py-0.5 rounded',
            alert ? 'bg-coral/20 text-coral' : 'bg-teal/20 text-teal'
          )}
        >
          {status}
        </span>
      </div>
      <pre className="p-3 overflow-x-auto text-white/70 max-h-[min(70vh,560px)] overflow-y-auto whitespace-pre">
{`// Blue Brilliant — Peixonautas
// ESP32: sonar, GPS, SD, pH/turb/TDS/OD, bomba eDNA

#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <TinyGPS++.h>
#include <SD.h>
#include <SPI.h>

const char* WIFI_SSID     = "Wokwi-GUEST";
const char* WIFI_PASS     = "";
const char* AIO_USERNAME  = "SEU_USUARIO_ADAFRUIT";
const char* AIO_KEY       = "SUA_CHAVE_ADAFRUIT";
const char* AIO_GROUP     = "boia";

const float    RAIO_PERIMETRO_CM       = 60.0f;
const int      NUM_AMOSTRAS_SONAR      = 5;
const unsigned long INTERVALO_CICLO_MS = 3000UL;
const unsigned long INTERVALO_EDNA_MS  = 60000UL;
const unsigned long DURACAO_BOMBA_MS   = 5000UL;

const int PIN_TRIG     = 25;
const int PIN_ECHO     = 26;
const int PIN_LED      = 27;
const int PIN_BUZZER   = 14;
const int PIN_SD_CS    = 5;
const int PIN_ONEWIRE  = 4;
const int PIN_PH       = 34;
const int PIN_TURBIDEZ = 35;
const int PIN_TDS      = 32;
const int PIN_OD       = 33;
const int PIN_BOMBA    = 13;

OneWire           oneWire(PIN_ONEWIRE);
DallasTemperature sensorTemp(&oneWire);
TinyGPSPlus       gps;
HardwareSerial    SerialGPS(2);

bool          sdDisponivel         = false;
unsigned long ultimaAmostragemMs   = 0;
int           contadorAmostrasEDNA = ${amostras};
bool          wifiOk               = false;

float medirDistanciaCM() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  long duracao = pulseIn(PIN_ECHO, HIGH, 30000UL);
  if (duracao == 0) return -1.0f;
  return (duracao * 0.0343f) / 2.0f;
}

float mediaSonar() {
  // live sim: ${d} cm
  return ${d}.0f;
}

float lerPH() {
  // live: ${phS}
  return ${phS}f;
}

float lerTurbidez() {
  // live: ${turbS} NTU
  return ${turbS}.0f;
}

float lerTDS() {
  // live: ${tdsS} ppm
  return ${tdsS}.0f;
}

float lerOD() {
  // live: ${odS} mg/L
  return ${odS}f;
}

float lerTemperatura() {
  // live: ${tempS} C
  return ${tempS}f;
}

void acionarBomba() {
  digitalWrite(PIN_BOMBA, HIGH);${pumping ? '  // << BOMBA ON' : ''}
  delay(DURACAO_BOMBA_MS);
  digitalWrite(PIN_BOMBA, LOW);
  contadorAmostrasEDNA++;
  ultimaAmostragemMs = millis();
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_BOMBA, OUTPUT);
  sensorTemp.begin();
  SerialGPS.begin(9600, SERIAL_8N1, 16, 17);
  SD.begin(PIN_SD_CS);
  // conectarWiFi();
  Serial.println(F("Blue Brilliant — Peixonautas ready"));
}

void loop() {
  float distancia = mediaSonar();   // ${d} cm
  float tempAgua  = lerTemperatura(); // ${tempS}
  float ph        = lerPH();          // ${phS}
  float turbidez  = lerTurbidez();    // ${turbS}
  float tds       = lerTDS();         // ${tdsS}
  float od        = lerOD();          // ${odS}

  bool alerta = (distancia > 0 && distancia < RAIO_PERIMETRO_CM);
  // alerta: ${alert ? 'TRUE' : 'false'}

  digitalWrite(PIN_LED,    alerta ? HIGH : LOW);${alert ? '  // ON' : ''}
  digitalWrite(PIN_BUZZER, alerta ? HIGH : LOW);${alert ? '  // ON' : ''}

  if (millis() - ultimaAmostragemMs >= INTERVALO_EDNA_MS) {
    acionarBomba();${pumping ? '  // filtrando...' : ''}
  }

  // gravarSD(...); enviarTelemetria(...);
  delay(INTERVALO_CICLO_MS);
}
`}
      </pre>
    </div>
  );
}
