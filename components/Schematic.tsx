'use client';

type Props = { alert: boolean; pumping: boolean };

export default function Schematic({ alert, pumping }: Props) {
  const hot = (id: string) => {
    if (alert && (id === 'led' || id === 'buzzer' || id === 'sonar' || id === 'esp')) return true;
    if (pumping && (id === 'relay' || id === 'esp' || id === 'pump')) return true;
    return false;
  };

  const wire = (active: boolean, color: string) =>
    active ? color : 'rgba(239,231,216,0.14)';
  const sw = (active: boolean) => (active ? 2.4 : 1.3);

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-[#071A2C] p-3 sm:p-5">
      <svg viewBox="0 0 760 460" className="w-full max-w-4xl mx-auto" aria-label="Esquema eletronico">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path d="M410 95 H500" stroke={wire(hot('sonar'), '#E3A857')} strokeWidth={sw(hot('sonar'))} fill="none" filter={hot('sonar') ? 'url(#glow)' : undefined} />
        <text x="450" y="88" fill="rgba(239,231,216,0.35)" fontSize="8" fontFamily="monospace">D5/D18</text>

        <path d="M410 155 H530" stroke={wire(hot('led'), '#E0653B')} strokeWidth={sw(hot('led'))} fill="none" filter={hot('led') ? 'url(#glow)' : undefined} />
        <text x="460" y="148" fill="rgba(239,231,216,0.35)" fontSize="8" fontFamily="monospace">D27</text>

        <path d="M410 200 H530" stroke={wire(hot('buzzer'), '#E0653B')} strokeWidth={sw(hot('buzzer'))} fill="none" filter={hot('buzzer') ? 'url(#glow)' : undefined} />
        <text x="460" y="193" fill="rgba(239,231,216,0.35)" fontSize="8" fontFamily="monospace">D14</text>

        <path d="M250 75 H115" stroke={wire(false, '#7FA3BE')} strokeWidth={1.3} fill="none" />
        <text x="170" y="68" fill="rgba(239,231,216,0.35)" fontSize="8" fontFamily="monospace">RX2/TX2</text>

        <path d="M250 145 H115" stroke={wire(false, '#7FA3BE')} strokeWidth={1.3} fill="none" />
        <text x="170" y="138" fill="rgba(239,231,216,0.35)" fontSize="8" fontFamily="monospace">SPI</text>

        <path d="M250 230 H115" stroke={wire(false, '#2FBE96')} strokeWidth={1.3} fill="none" />
        <text x="170" y="223" fill="rgba(239,231,216,0.35)" fontSize="8" fontFamily="monospace">D4</text>

        <path d="M290 295 V340" stroke={wire(false, '#2FBE96')} strokeWidth={1.3} fill="none" />
        <path d="M200 340 H420" stroke={wire(false, '#2FBE96')} strokeWidth={1.3} fill="none" />
        <text x="300" y="333" fill="rgba(239,231,216,0.35)" fontSize="8" fontFamily="monospace">ADC</text>

        <path d="M410 260 H530 V310" stroke={wire(hot('relay'), '#E3A857')} strokeWidth={sw(hot('relay'))} fill="none" filter={hot('relay') ? 'url(#glow)' : undefined} />
        <text x="460" y="253" fill="rgba(239,231,216,0.35)" fontSize="8" fontFamily="monospace">D13</text>

        <g transform="translate(250,55)">
          <rect width="160" height="230" rx="7" fill="#141414" stroke={hot('esp') ? '#2FBE96' : '#3a3a3a'} strokeWidth={hot('esp') ? 2.2 : 1.2} filter={hot('esp') ? 'url(#glow)' : undefined} />
          <rect x="58" y="-7" width="44" height="11" rx="2" fill="#222" stroke="#555" />
          <text x="80" y="8" textAnchor="middle" fill="rgba(239,231,216,0.3)" fontSize="7" fontFamily="monospace">USB</text>
          <rect x="48" y="70" width="64" height="54" rx="3" fill="#0c0c0c" stroke="#3a3a3a" />
          <text x="80" y="102" textAnchor="middle" fill="#2FBE96" fontSize="10" fontFamily="monospace" fontWeight="600">ESP32</text>
          <path d="M68 40 Q80 18 92 40" fill="none" stroke="#555" strokeWidth="1.5" />
          {Array.from({ length: 15 }).map((_, i) => (
            <rect key={`L${i}`} x="-5" y={14 + i * 13.5} width="9" height="5.5" rx="1" fill="#c9a84c" />
          ))}
          {Array.from({ length: 15 }).map((_, i) => (
            <rect key={`R${i}`} x="156" y={14 + i * 13.5} width="9" height="5.5" rx="1" fill="#c9a84c" />
          ))}
          <text x="80" y="218" textAnchor="middle" fill="rgba(239,231,216,0.45)" fontSize="8" fontFamily="monospace">DevKit C v4</text>
        </g>

        <g transform="translate(15,35)">
          <rect width="95" height="72" rx="5" fill="#0a1f14" stroke="#2FBE96" strokeWidth="1.2" />
          <rect x="8" y="10" width="52" height="38" rx="2" fill="#111" stroke="#3a3a3a" />
          <circle cx="75" cy="28" r="12" fill="none" stroke="#7FA3BE" strokeWidth="1.5" />
          <circle cx="75" cy="28" r="3.5" fill="#7FA3BE" />
          <text x="47" y="64" textAnchor="middle" fill="rgba(239,231,216,0.55)" fontSize="8" fontFamily="monospace">NEO-6M GPS</text>
        </g>

        <g transform="translate(15,130)">
          <rect width="95" height="52" rx="5" fill="#16121c" stroke="#7FA3BE" strokeWidth="1.2" />
          <rect x="14" y="10" width="58" height="28" rx="2" fill="#1a1a1a" stroke="#444" />
          <rect x="20" y="14" width="14" height="9" fill="#c9a84c" opacity="0.75" />
          <text x="47" y="46" textAnchor="middle" fill="rgba(239,231,216,0.55)" fontSize="8" fontFamily="monospace">microSD</text>
        </g>

        <g transform="translate(25,215)">
          <rect x="28" y="0" width="32" height="48" rx="3" fill="#222" stroke="#2FBE96" strokeWidth="1.2" />
          <rect x="33" y="5" width="22" height="14" fill="#0c0c0c" />
          <line x1="33" y1="52" x2="33" y2="64" stroke="#777" strokeWidth="1.2" />
          <line x1="44" y1="52" x2="44" y2="64" stroke="#777" strokeWidth="1.2" />
          <line x1="55" y1="52" x2="55" y2="64" stroke="#777" strokeWidth="1.2" />
          <text x="44" y="80" textAnchor="middle" fill="rgba(239,231,216,0.55)" fontSize="8" fontFamily="monospace">DS18B20</text>
        </g>

        {[
          { x: 175, label: 'pH', pin: 'D34' },
          { x: 250, label: 'Turb', pin: 'D35' },
          { x: 325, label: 'TDS', pin: 'D32' },
          { x: 400, label: 'OD', pin: 'D33' },
        ].map((s) => (
          <g key={s.label} transform={`translate(${s.x},355)`}>
            <rect width="58" height="48" rx="5" fill="#0c2438" stroke="#2FBE96" strokeWidth="1.2" />
            <circle cx="29" cy="18" r="8" fill="#071A2C" stroke="#2FBE96" strokeWidth="1.2" />
            <circle cx="29" cy="18" r="3" fill="#2FBE96" opacity="0.5" />
            <text x="29" y="38" textAnchor="middle" fill="rgba(239,231,216,0.65)" fontSize="9" fontFamily="monospace">{s.label}</text>
            <text x="29" y="58" textAnchor="middle" fill="rgba(239,231,216,0.3)" fontSize="7" fontFamily="monospace">{s.pin}</text>
          </g>
        ))}

        <g transform="translate(520,45)">
          <rect width="110" height="60" rx="5" fill="#141414" stroke={hot('sonar') ? '#E3A857' : '#444'} strokeWidth={hot('sonar') ? 2.2 : 1.2} filter={hot('sonar') ? 'url(#glow)' : undefined} />
          <circle cx="32" cy="30" r="16" fill="#0a0a0a" stroke="#777" strokeWidth="2" />
          <circle cx="78" cy="30" r="16" fill="#0a0a0a" stroke="#777" strokeWidth="2" />
          <circle cx="32" cy="30" r="7" fill="#1a1a1a" />
          <circle cx="78" cy="30" r="7" fill="#1a1a1a" />
          <text x="55" y="75" textAnchor="middle" fill="rgba(239,231,216,0.5)" fontSize="8" fontFamily="monospace">HC-SR04</text>
        </g>

        <g transform="translate(550,140)">
          <circle cx="22" cy="16" r="14" fill={hot('led') ? '#E0653B' : '#2a1210'} stroke={hot('led') ? '#E0653B' : '#555'} strokeWidth={hot('led') ? 2.2 : 1.2} filter={hot('led') ? 'url(#glow)' : undefined} />
          {hot('led') && (
            <circle cx="22" cy="16" r="20" fill="none" stroke="#E0653B" strokeWidth="1" opacity="0.35" />
          )}
          <line x1="14" y1="30" x2="10" y2="42" stroke="#777" />
          <line x1="30" y1="30" x2="34" y2="42" stroke="#777" />
          <text x="22" y="56" textAnchor="middle" fill="rgba(239,231,216,0.5)" fontSize="8" fontFamily="monospace">LED</text>
        </g>

        <g transform="translate(550,200)">
          <circle cx="22" cy="18" r="16" fill="#141414" stroke={hot('buzzer') ? '#E0653B' : '#444'} strokeWidth={hot('buzzer') ? 2.2 : 1.2} filter={hot('buzzer') ? 'url(#glow)' : undefined} />
          <circle cx="22" cy="18" r="7" fill="#2a2a2a" />
          <circle cx="22" cy="18" r="3" fill="#444" />
          <text x="22" y="48" textAnchor="middle" fill="rgba(239,231,216,0.5)" fontSize="8" fontFamily="monospace">Buzzer</text>
        </g>

        <g transform="translate(520,300)">
          <rect width="120" height="60" rx="5" fill="#16121c" stroke={hot('relay') ? '#E3A857' : '#444'} strokeWidth={hot('relay') ? 2.2 : 1.2} filter={hot('relay') ? 'url(#glow)' : undefined} />
          <rect x="10" y="12" width="40" height="36" rx="3" fill="#2a1a00" stroke="#E3A857" opacity="0.9" />
          <text x="30" y="34" textAnchor="middle" fill="#E3A857" fontSize="8" fontFamily="monospace">RELE</text>
          <rect x="58" y="14" width="50" height="32" rx="3" fill="#0c2438" stroke="#2FBE96" strokeWidth={hot('pump') ? 2 : 1.2} />
          <text x="83" y="34" textAnchor="middle" fill="#2FBE96" fontSize="8" fontFamily="monospace">BOMBA</text>
          <text x="60" y="75" textAnchor="middle" fill="rgba(239,231,216,0.5)" fontSize="8" fontFamily="monospace">eDNA</text>
        </g>
      </svg>
    </div>
  );
}
