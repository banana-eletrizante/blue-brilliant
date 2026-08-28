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

  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0f14] overflow-hidden font-mono text-[11px] leading-relaxed">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/[0.03]">
        <span className="text-white/40">firmware/sketch.ino</span>
        <span
          className={clsx(
            'text-[10px] px-2 py-0.5 rounded',
            alert ? 'bg-coral/20 text-coral' : 'bg-teal/20 text-teal'
          )}
        >
          {status}
        </span>
      </div>
      <pre className="p-3 overflow-x-auto text-white/70 max-h-[480px] overflow-y-auto whitespace-pre">
{`// Blue Brilliant — Peixonautas
// ESP32: sonar, GPS, SD, sensores, eDNA

#include <WiFi.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <TinyGPS++.h>
#include <SD.h>

const float RAIO_PERIMETRO_CM = 60.0;
const int   PIN_TRIG = 25, PIN_ECHO = 26;
const int   PIN_LED = 27, PIN_BUZZER = 14;
const int   PIN_BOMBA = 13, PIN_SD_CS = 5;
const int   PIN_PH = 34, PIN_TURB = 35;
const int   PIN_TDS = 32, PIN_OD = 33;
const int   PIN_TEMP = 4;

OneWire oneWire(PIN_TEMP);
DallasTemperature sensorTemp(&oneWire);
TinyGPSPlus gps;

int amostrasEDNA = ${amostras};

float mediaSonar() {
  // media de 5 leituras
  return ${dist}.0;  // live: ${dist} cm
}

void loop() {
  float dist = mediaSonar();
  float ph   = ${ph.toFixed(2)};   // ADC D34
  float turb = ${Math.round(turb)}.0;  // ADC D35
  float tds  = ${Math.round(tds)}.0;   // ADC D32
  float od   = ${od.toFixed(1)};   // ADC D33
  float temp = ${temp.toFixed(1)}; // DS18B20

  bool alerta = (dist > 0 && dist < RAIO_PERIMETRO_CM);
  // alerta agora: ${alert ? 'TRUE' : 'false'}

  digitalWrite(PIN_LED,    alerta ? HIGH : LOW);${alert ? '  // ON' : ''}
  digitalWrite(PIN_BUZZER, alerta ? HIGH : LOW);${alert ? '  // ON' : ''}

  if (millis() % 60000UL < 50) {
    digitalWrite(PIN_BOMBA, HIGH);${pumping ? ' // BOMBA' : ''}
    delay(5000);
    digitalWrite(PIN_BOMBA, LOW);
    amostrasEDNA++;
  }

  // gravarSD(...) + enviarWiFi(...)
  delay(3000);
}`}
      </pre>
    </div>
  );
}
