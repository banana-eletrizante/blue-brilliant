'use client';

import { useState } from 'react';

const BLOCKS = [
  { id: 'esp32', label: 'ESP32 DevKit', x: 280, y: 180, w: 140, h: 160, color: '#2FBE96' },
  { id: 'sonar', label: 'HC-SR04 Sonar', x: 480, y: 40, w: 100, h: 70, color: '#E3A857' },
  { id: 'led', label: 'LED alerta', x: 500, y: 160, w: 90, h: 40, color: '#E0653B' },
  { id: 'buzzer', label: 'Buzzer', x: 500, y: 220, w: 90, h: 40, color: '#E0653B' },
  { id: 'gps', label: 'NEO-6M GPS', x: 40, y: 40, w: 100, h: 70, color: '#7FA3BE' },
  { id: 'sd', label: 'microSD', x: 40, y: 140, w: 100, h: 50, color: '#7FA3BE' },
  { id: 'temp', label: 'DS18B20 Temp', x: 40, y: 220, w: 100, h: 60, color: '#2FBE96' },
  { id: 'ph', label: 'pH', x: 40, y: 310, w: 70, h: 40, color: '#2FBE96' },
  { id: 'turb', label: 'Turbidez', x: 120, y: 310, w: 70, h: 40, color: '#2FBE96' },
  { id: 'tds', label: 'TDS', x: 200, y: 310, w: 70, h: 40, color: '#2FBE96' },
  { id: 'od', label: 'OD', x: 280, y: 310, w: 70, h: 40, color: '#2FBE96' },
  { id: 'relay', label: 'Relé + Bomba eDNA', x: 480, y: 300, w: 110, h: 60, color: '#E3A857' },
];

const WIRES = [
  { from: 'esp32', to: 'sonar', label: 'TRIG/ECHO', color: '#2FBE96' },
  { from: 'esp32', to: 'led', label: 'D27', color: '#E0653B' },
  { from: 'esp32', to: 'buzzer', label: 'D14', color: '#E0653B' },
  { from: 'esp32', to: 'gps', label: 'RX2/TX', color: '#7FA3BE' },
  { from: 'esp32', to: 'sd', label: 'SPI', color: '#7FA3BE' },
  { from: 'esp32', to: 'temp', label: 'D4', color: '#2FBE96' },
  { from: 'esp32', to: 'ph', label: 'D34', color: '#2FBE96' },
  { from: 'esp32', to: 'turb', label: 'D35', color: '#2FBE96' },
  { from: 'esp32', to: 'tds', label: 'D32', color: '#2FBE96' },
  { from: 'esp32', to: 'od', label: 'D33', color: '#2FBE96' },
  { from: 'esp32', to: 'relay', label: 'D13', color: '#E3A857' },
];

export default function Schematic({ alert, pumping }: { alert: boolean; pumping: boolean }) {
  const [hover, setHover] = useState<string | null>(null);

  const getCenter = (id: string) => {
    const b = BLOCKS.find((x) => x.id === id)!;
    return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 640 400" className="w-full max-w-3xl mx-auto">
        {WIRES.map((w, i) => {
          const a = getCenter(w.from);
          const b = getCenter(w.to);
          const active =
            (alert && (w.to === 'led' || w.to === 'buzzer' || w.to === 'sonar')) ||
            (pumping && w.to === 'relay');
          return (
            <g key={i}>
              <line
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={active ? w.color : 'rgba(239,231,216,0.15)'}
                strokeWidth={active ? 2.5 : 1.2}
                strokeDasharray={active ? '0' : '4 3'}
                className="transition-all duration-300"
              />
              {w.label && (
                <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 6}
                  fill="rgba(239,231,216,0.35)" fontSize="9"
                  fontFamily="JetBrains Mono, monospace" textAnchor="middle">
                  {w.label}
                </text>
              )}
            </g>
          );
        })}
        {BLOCKS.map((b) => {
          const isHot =
            (alert && (b.id === 'led' || b.id === 'buzzer' || b.id === 'sonar' || b.id === 'esp32')) ||
            (pumping && (b.id === 'relay' || b.id === 'esp32'));
          return (
            <g key={b.id} onMouseEnter={() => setHover(b.id)} onMouseLeave={() => setHover(null)}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={8}
                fill={isHot || hover === b.id ? 'rgba(15,46,77,0.95)' : 'rgba(11,36,64,0.9)'}
                stroke={isHot ? b.color : hover === b.id ? b.color : 'rgba(239,231,216,0.12)'}
                strokeWidth={isHot ? 2 : 1}
                className="transition-all duration-300"
              />
              <text x={b.x + b.w / 2} y={b.y + b.h / 2}
                fill={isHot ? b.color : '#EFE7D8'} fontSize="11"
                fontFamily="JetBrains Mono, monospace" textAnchor="middle" dominantBaseline="middle">
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="font-mono text-[11px] text-mist text-center mt-2">
        Esquema simplificado · fios se iluminam no alerta / coleta eDNA · baseado no diagram.json
      </p>
    </div>
  );
}
