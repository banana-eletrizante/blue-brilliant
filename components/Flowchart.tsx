'use client';

const STEPS = [
  { n: '1', title: 'Ler sensores', desc: 'pH, turbidez, TDS, OD, temperatura e distância (média de 5)' },
  { n: '2', title: 'Decidir alerta', desc: 'Se distância < perímetro → LED + buzzer' },
  { n: '3', title: 'Coletar eDNA?', desc: 'Se intervalo venceu → aciona bomba peristáltica' },
  { n: '4', title: 'Registrar', desc: 'CSV no microSD + telemetria WiFi (Adafruit IO)' },
];

export default function Flowchart() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STEPS.map((s, i) => (
        <div key={s.n} className="relative">
          <div className="bg-navy border border-white/10 rounded-xl p-4 h-full">
            <div className="w-8 h-8 rounded-full bg-teal text-navy-deep font-mono font-bold text-sm flex items-center justify-center mb-3">
              {s.n}
            </div>
            <h3 className="font-display font-semibold text-sand text-sm mb-1">{s.title}</h3>
            <p className="font-mono text-[11px] text-sand-dim leading-relaxed">{s.desc}</p>
          </div>
          {i < STEPS.length - 1 && (
            <div className="hidden lg:block absolute top-1/2 -right-3 text-teal text-lg">→</div>
          )}
        </div>
      ))}
    </div>
  );
}
