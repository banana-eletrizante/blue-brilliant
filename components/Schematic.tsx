'use client';

type Props = { alert: boolean; pumping: boolean };

export default function Schematic({ alert, pumping }: Props) {
  const hot = (id: string) => {
    if (alert && (id === 'led' || id === 'buzzer' || id === 'sonar' || id === 'esp')) return true;
    if (pumping && (id === 'relay' || id === 'esp')) return true;
    return false;
  };

  const wire = (active: boolean, color: string) =>
    active ? color : 'rgba(239,231,216,0.12)';

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-[#071A2C] p-4 md:p-6">
      <svg viewBox="0 0 720 420" className="w-full max-w-4xl mx-auto" aria-label="Esquema eletronico">
        <path d="M400 100 H480" stroke={wire(hot('sonar'), '#E3A857')} strokeWidth={hot('sonar') ? 2.2 : 1.2} fill="none" />
        <path d="M400 150 H500" stroke={wire(hot('led'), '#E0653B')} strokeWidth={hot('led') ? 2.2 : 1.2} fill="none" />
        <path d="M400 190 H500" stroke={wire(hot('buzzer'), '#E0653B')} strokeWidth={hot('buzzer') ? 2.2 : 1.2} fill="none" />
        <path d="M240 80 H120" stroke={wire(false, '#7FA3BE')} strokeWidth={1.2} fill="none" />
        <path d="M240 140 H120" stroke={wire(false, '#7FA3BE')} strokeWidth={1.2} fill="none" />
        <path d="M240 220 H120" stroke={wire(false, '#2FBE96')} strokeWidth={1.2} fill="none" />
        <path d="M280 280 V320" stroke={wire(false, '#2FBE96')} strokeWidth={1.2} fill="none" />
        <path d="M220 320 H360" stroke={wire(false, '#2FBE96')} strokeWidth={1.2} fill="none" />
        <path d="M400 250 H500 V300" stroke={wire(hot('relay'), '#E3A857')} strokeWidth={hot('relay') ? 2.2 : 1.2} fill="none" />

        <g transform="translate(240,60)">
          <rect width="160" height="220" rx="6" fill="#1a1a1a" stroke={hot('esp') ? '#2FBE96' : '#333'} strokeWidth={hot('esp') ? 2 : 1} />
          <rect x="60" y="-6" width="40" height="10" rx="2" fill="#2a2a2a" stroke="#555" />
          <rect x="50" y="70" width="60" height="50" rx="3" fill="#111" stroke="#444" />
          <text x="80" y="100" textAnchor="middle" fill="#2FBE96" fontSize="9" fontFamily="monospace">ESP32</text>
          <path d="M70 40 Q80 20 90 40" fill="none" stroke="#666" strokeWidth="1.5" />
          {Array.from({ length: 15 }).map((_, i) => (
            <rect key={`L${i}`} x="-4" y={12 + i * 13} width="8" height="5" rx="1" fill="#c9a84c" />
          ))}
          {Array.from({ length: 15 }).map((_, i) => (
            <rect key={`R${i}`} x="156" y={12 + i * 13} width="8" height="5" rx="1" fill="#c9a84c" />
          ))}
          <text x="80" y="210" textAnchor="middle" fill="rgba(239,231,216,0.5)" fontSize="8" fontFamily="monospace">DevKit C</text>
        </g>

        <g transform="translate(20,40)">
          <rect width="90" height="70" rx="4" fill="#0d2818" stroke="#2FBE96" strokeWidth="1" />
          <rect x="10" y="12" width="50" height="35" rx="2" fill="#1a1a1a" stroke="#444" />
          <circle cx="72" cy="28" r="10" fill="none" stroke="#7FA3BE" strokeWidth="1.5" />
          <circle cx="72" cy="28" r="3" fill="#7FA3BE" />
          <text x="45" y="62" textAnchor="middle" fill="rgba(239,231,216,0.55)" fontSize="8" fontFamily="monospace">NEO-6M</text>
        </g>

        <g transform="translate(20,130)">
          <rect width="90" height="50" rx="4" fill="#1a1520" stroke="#7FA3BE" strokeWidth="1" />
          <rect x="15" y="10" width="55" height="30" rx="2" fill="#222" stroke="#555" />
          <rect x="20" y="14" width="12" height="8" fill="#c9a84c" opacity="0.7" />
          <text x="45" y="44" textAnchor="middle" fill="rgba(239,231,216,0.55)" fontSize="8" fontFamily="monospace">microSD</text>
        </g>

        <g transform="translate(25,210)">
          <rect x="25" y="0" width="30" height="45" rx="3" fill="#2a2a2a" stroke="#2FBE96" />
          <rect x="30" y="5" width="20" height="12" fill="#111" />
          <line x1="30" y1="50" x2="30" y2="62" stroke="#888" />
          <line x1="40" y1="50" x2="40" y2="62" stroke="#888" />
          <line x1="50" y1="50" x2="50" y2="62" stroke="#888" />
          <text x="40" y="78" textAnchor="middle" fill="rgba(239,231,216,0.55)" fontSize="8" fontFamily="monospace">DS18B20</text>
        </g>

        {[
          { x: 180, label: 'pH' },
          { x: 250, label: 'Turb' },
          { x: 320, label: 'TDS' },
          { x: 390, label: 'OD' },
        ].map((s) => (
          <g key={s.label} transform={`translate(${s.x},330)`}>
            <rect width="55" height="40" rx="4" fill="#0F2E4D" stroke="#2FBE96" strokeWidth="1" />
            <circle cx="27" cy="16" r="7" fill="#071A2C" stroke="#2FBE96" />
            <text x="27" y="34" textAnchor="middle" fill="rgba(239,231,216,0.6)" fontSize="8" fontFamily="monospace">{s.label}</text>
          </g>
        ))}

        <g transform="translate(500,50)">
          <rect width="100" height="55" rx="4" fill="#1a1a1a" stroke={hot('sonar') ? '#E3A857' : '#555'} strokeWidth={hot('sonar') ? 2 : 1} />
          <circle cx="30" cy="28" r="14" fill="#0a0a0a" stroke="#888" strokeWidth="2" />
          <circle cx="70" cy="28" r="14" fill="#0a0a0a" stroke="#888" strokeWidth="2" />
          <circle cx="30" cy="28" r="6" fill="#222" />
          <circle cx="70" cy="28" r="6" fill="#222" />
          <text x="50" y="70" textAnchor="middle" fill="rgba(239,231,216,0.5)" fontSize="8" fontFamily="monospace">HC-SR04</text>
        </g>

        <g transform="translate(520,140)">
          <circle cx="20" cy="14" r="12" fill={hot('led') ? '#E0653B' : '#3a1510'} stroke={hot('led') ? '#E0653B' : '#666'} strokeWidth={hot('led') ? 2 : 1} />
          <line x1="14" y1="26" x2="10" y2="38" stroke="#888" />
          <line x1="26" y1="26" x2="30" y2="38" stroke="#888" />
          <text x="20" y="52" textAnchor="middle" fill="rgba(239,231,216,0.5)" fontSize="8" fontFamily="monospace">LED</text>
        </g>

        <g transform="translate(520,195)">
          <circle cx="20" cy="16" r="14" fill="#1a1a1a" stroke={hot('buzzer') ? '#E0653B' : '#555'} strokeWidth={hot('buzzer') ? 2 : 1} />
          <circle cx="20" cy="16" r="6" fill="#333" />
          <text x="20" y="42" textAnchor="middle" fill="rgba(239,231,216,0.5)" fontSize="8" fontFamily="monospace">Buzzer</text>
        </g>

        <g transform="translate(500,290)">
          <rect width="110" height="55" rx="4" fill="#1a1520" stroke={hot('relay') ? '#E3A857' : '#555'} strokeWidth={hot('relay') ? 2 : 1} />
          <rect x="10" y="12" width="35" height="30" rx="2" fill="#2a1a00" stroke="#E3A857" opacity="0.8" />
          <text x="27" y="31" textAnchor="middle" fill="#E3A857" fontSize="7" fontFamily="monospace">RELE</text>
          <rect x="55" y="15" width="45" height="24" rx="3" fill="#0F2E4D" stroke="#2FBE96" />
          <text x="77" y="31" textAnchor="middle" fill="#2FBE96" fontSize="7" fontFamily="monospace">BOMBA</text>
          <text x="55" y="70" textAnchor="middle" fill="rgba(239,231,216,0.5)" fontSize="8" fontFamily="monospace">eDNA</text>
        </g>
      </svg>
    </div>
  );
}
