'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import clsx from 'clsx';
import Schematic from './Schematic';
import Flowchart from './Flowchart';

const BuoyScene = dynamic(() => import('./BuoyScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] rounded-xl bg-navy-deep/80 border border-white/10 flex items-center justify-center">
      <span className="font-mono text-sm text-mist animate-pulse">Carregando modelo 3D…</span>
    </div>
  ),
});

type Preset = 'normal' | 'poluida' | 'algas' | 'acida';

const PRESETS: Record<Preset, { ph: number; turb: number; tds: number; od: number; temp: number; label: string }> = {
  normal:  { ph: 7.2, turb: 12,  tds: 180, od: 7.5, temp: 23.4, label: 'Água limpa' },
  poluida: { ph: 6.3, turb: 85,  tds: 520, od: 3.1, temp: 25.1, label: 'Água poluída' },
  algas:   { ph: 8.6, turb: 60,  tds: 310, od: 2.4, temp: 27.8, label: 'Floração de algas' },
  acida:   { ph: 4.8, turb: 20,  tds: 210, od: 5.9, temp: 19.6, label: 'Chuva ácida' },
};

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function pct(v: number, min: number, max: number) {
  return clamp(((v - min) / (max - min)) * 100, 0, 100);
}

function barColor(v: number, min: number, ok: [number, number], max: number) {
  if (v < min || v > max) return 'bg-coral';
  if (v < ok[0] || v > ok[1]) return 'bg-amber';
  return 'bg-teal';
}

export default function Dashboard() {
  const [dist, setDist] = useState(120);
  const [ph, setPh] = useState(7.2);
  const [turb, setTurb] = useState(12);
  const [tds, setTds] = useState(180);
  const [od, setOd] = useState(7.5);
  const [temp, setTemp] = useState(23.4);
  const [amostras, setAmostras] = useState(0);
  const [ultimaColeta, setUltimaColeta] = useState<string>('—');
  const [nextCycle, setNextCycle] = useState(60);
  const [pumping, setPumping] = useState(false);
  const [preset, setPreset] = useState<Preset>('normal');
  const [logs, setLogs] = useState<{ t: string; msg: string; warn: boolean }[]>([]);
  const [lat] = useState(-23.9608);
  const [lng] = useState(-46.3336);

  const perimetro = 60;
  const alert = dist < perimetro;

  const addLog = useCallback((msg: string, warn = false) => {
    const t = new Date().toLocaleTimeString('pt-BR');
    setLogs((prev) => [{ t, msg, warn }, ...prev].slice(0, 14));
  }, []);

  const coletar = useCallback(() => {
    if (pumping) return;
    setPumping(true);
    addLog('Bomba de eDNA acionada — coletando amostra');
    setTimeout(() => {
      setAmostras((n) => n + 1);
      setUltimaColeta(new Date().toLocaleTimeString('pt-BR'));
      setPumping(false);
      addLog('Amostra de eDNA coletada — filtro pronto para recolhimento');
    }, 1800);
  }, [pumping, addLog]);

  useEffect(() => {
    const id = setInterval(() => {
      setNextCycle((n) => {
        if (n <= 1) { coletar(); return 60; }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [coletar]);

  useEffect(() => {
    const id = setInterval(() => {
      setPh((v) => clamp(v + (Math.random() - 0.5) * 0.06, 0, 14));
      setTurb((v) => clamp(v + (Math.random() - 0.5) * 1.5, 0, 200));
      setTds((v) => clamp(v + (Math.random() - 0.5) * 4, 0, 800));
      setOd((v) => clamp(v + (Math.random() - 0.5) * 0.15, 0, 12));
      setTemp((v) => clamp(v + (Math.random() - 0.5) * 0.1, 5, 40));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      addLog(`dist=${dist}cm ph=${ph.toFixed(2)} turb=${Math.round(turb)}NTU od=${od.toFixed(1)}mg/L`, dist < perimetro);
    }, 4000);
    return () => clearInterval(id);
  }, [dist, ph, turb, od, addLog]);

  useEffect(() => { addLog('Sistema iniciado — telemetria ativa'); }, [addLog]);

  const applyPreset = (key: Preset) => {
    const p = PRESETS[key];
    setPreset(key);
    setPh(p.ph); setTurb(p.turb); setTds(p.tds); setOd(p.od); setTemp(p.temp);
    addLog(`Cenário alterado: ${p.label.toLowerCase()}`);
  };

  const metrics = [
    { label: 'Distância', value: `${dist}`, unit: 'cm', pct: pct(dist, 0, 200), color: alert ? 'bg-coral' : 'bg-teal' },
    { label: 'pH', value: ph.toFixed(2), unit: '', pct: pct(ph, 0, 14), color: barColor(ph, 4, [6.5, 8.5], 10) },
    { label: 'Turbidez', value: `${Math.round(turb)}`, unit: 'NTU', pct: pct(turb, 0, 100), color: barColor(turb, 0, [0, 40], 100) },
    { label: 'TDS', value: `${Math.round(tds)}`, unit: 'ppm', pct: pct(tds, 0, 600), color: barColor(tds, 0, [0, 400], 600) },
    { label: 'Oxigênio', value: od.toFixed(1), unit: 'mg/L', pct: pct(od, 0, 10), color: barColor(od, 0, [4, 10], 10) },
    { label: 'Temperatura', value: temp.toFixed(1), unit: '°C', pct: pct(temp, 10, 35), color: 'bg-teal' },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 px-6 md:px-[6vw] py-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-[0.14em] text-teal uppercase mb-2">Blue Brilliant · Sistema de monitoramento aquático</p>
          <h1 className="font-display text-2xl md:text-4xl font-semibold text-sand max-w-2xl leading-tight">
            Boia de delimitação de biodiversidade e detecção de espécies invasoras
          </h1>
        </div>
        <div className={clsx('font-mono text-xs flex items-center gap-2 px-3.5 py-2 rounded-full border', alert ? 'border-coral text-coral' : 'border-white/10 text-sand-dim')}>
          <span className={clsx('w-2 h-2 rounded-full', alert ? 'bg-coral shadow-[0_0_10px_#E0653B] animate-pulse' : 'bg-teal shadow-[0_0_8px_#2FBE96]')} />
          {alert ? 'Objeto detectado' : 'Perímetro livre'}
        </div>
      </header>

      <main className="px-6 md:px-[6vw] pb-16">
        <section className="grid lg:grid-cols-2 gap-10 py-10 border-b border-white/10 items-center">
          <div className="relative"><BuoyScene alert={alert} pumping={pumping} dist={dist} /></div>
          <div>
            <span className="font-mono text-xs text-amber tracking-wider">Como funciona</span>
            <h2 className="font-display text-xl md:text-2xl font-semibold mt-2 mb-4">Um instrumento, três frentes</h2>
            <p className="text-sand-dim text-[15px] leading-relaxed mb-3 max-w-md">
              O sonar delimita um perímetro físico e sinaliza quando algo o cruza. Os sensores leem continuamente a condição química da água. A bomba de eDNA coleta amostras periódicas para identificar espécies que os outros sensores não conseguem ver.
            </p>
            <div className="flex flex-wrap gap-4 mt-5 font-mono text-xs text-sand-dim">
              <div>Lat: <span className="text-sand">{lat.toFixed(4)}</span></div>
              <div>Lng: <span className="text-sand">{lng.toFixed(4)}</span></div>
              <div>Amostras eDNA: <span className="text-sand">{amostras}</span></div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-white/10 border border-white/10 mt-8">
          {metrics.map((m) => (
            <div key={m.label} className="bg-navy-deep p-4 md:p-5">
              <div className="font-mono text-[11px] text-sand-dim uppercase tracking-wider">{m.label}</div>
              <div className="font-mono text-2xl font-medium mt-1.5">{m.value}{m.unit && <span className="text-sm text-mist ml-1">{m.unit}</span>}</div>
              <div className="h-[3px] bg-white/10 mt-2.5 rounded overflow-hidden">
                <div className={clsx('h-full transition-all duration-400', m.color)} style={{ width: `${m.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        <section className="py-10 border-b border-white/10">
          <span className="font-mono text-xs text-amber tracking-wider">Sonar · perímetro</span>
          <h2 className="font-display text-xl font-semibold mt-1 mb-2">Delimitação e alerta de invasão</h2>
          <p className="text-sand-dim text-[15px] max-w-xl mb-6">Quando a distância medida cai abaixo de {perimetro} cm, o sistema aciona LED e buzzer.</p>
          <div className="max-w-lg mb-5">
            <div className="flex justify-between font-mono text-xs text-sand-dim mb-2"><span>Distância do objeto</span><span>{dist} cm</span></div>
            <input type="range" min={10} max={200} value={dist} onChange={(e) => setDist(Number(e.target.value))} />
          </div>
          <div className={clsx('flex items-center gap-3 px-4 py-3 rounded-lg border font-mono text-sm transition-all', alert ? 'bg-coral/10 border-coral text-coral' : 'bg-white/[0.03] border-white/10 text-sand-dim')}>
            <span className={clsx('w-2.5 h-2.5 rounded-full border-2', alert ? 'bg-coral border-coral' : 'border-teal')} />
            {alert ? `Alerta: objeto dentro do perímetro de ${perimetro} cm — LED e buzzer acionados` : `Nenhum objeto dentro do perímetro de ${perimetro} cm`}
          </div>
        </section>

        <section className="py-10 border-b border-white/10">
          <span className="font-mono text-xs text-amber tracking-wider">Qualidade da água</span>
          <h2 className="font-display text-xl font-semibold mt-1 mb-2">Cenários de campo</h2>
          <p className="text-sand-dim text-[15px] max-w-xl mb-5">Presets que alteram todas as leituras químicas simultaneamente.</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PRESETS) as Preset[]).map((key) => (
              <button key={key} onClick={() => applyPreset(key)} className={clsx('font-mono text-xs px-3.5 py-2 rounded-md border transition-all', preset === key ? 'border-teal text-teal bg-teal/10' : 'border-white/10 text-sand-dim hover:border-teal hover:text-sand')}>
                {PRESETS[key].label}
              </button>
            ))}
          </div>
        </section>

        <section className="py-10 border-b border-white/10">
          <span className="font-mono text-xs text-amber tracking-wider">DNA ambiental</span>
          <h2 className="font-display text-xl font-semibold mt-1 mb-2">Auto-amostrador de eDNA</h2>
          <p className="text-sand-dim text-[15px] max-w-xl mb-6">A bomba filtra água em uma membrana (0,22–0,45 µm). O filtro é recolhido e analisado em laboratório por PCR ou sequenciamento. Cada amostra nasce com GPS e timestamp.</p>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 rounded-full border-2 border-white/10 flex items-center justify-center overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 bg-amber/40 transition-all duration-[1800ms] linear" style={{ height: pumping ? '85%' : amostras > 0 ? '40%' : '0%' }} />
                <span className="font-mono text-[11px] text-sand-dim z-10">{pumping ? 'Filtrando…' : amostras > 0 ? 'Filtro pronto' : 'Filtro limpo'}</span>
              </div>
              <button onClick={coletar} disabled={pumping} className="font-mono text-sm bg-teal text-navy-deep font-medium px-5 py-2.5 rounded-md disabled:opacity-40 hover:opacity-90 transition">
                {pumping ? 'Coletando…' : 'Simular coleta de amostra'}
              </button>
            </div>
            <div className="font-mono text-xs text-sand-dim space-y-2 leading-relaxed">
              <div>Amostras coletadas: <strong className="text-sand">{amostras}</strong></div>
              <div>Última coleta: <strong className="text-sand">{ultimaColeta}</strong></div>
              <div>Próximo ciclo automático: <strong className="text-sand">{nextCycle}s</strong></div>
              <p className="pt-3 max-w-sm">Cada filtro corresponde a um registro de data, hora e coordenadas GPS.</p>
            </div>
          </div>
        </section>

        <section className="py-10 border-b border-white/10">
          <span className="font-mono text-xs text-amber tracking-wider">Telemetria</span>
          <h2 className="font-display text-xl font-semibold mt-1 mb-2">Log de eventos</h2>
          <p className="text-sand-dim text-[15px] max-w-xl mb-5">Feed equivalente ao que a boia envia via WiFi para o painel remoto.</p>
          <div className="bg-navy-deep border border-white/10 rounded-lg p-4 font-mono text-xs max-h-56 overflow-y-auto">
            {logs.map((l, i) => (
              <div key={i} className={clsx('py-1 border-b border-white/5 last:border-0', l.warn ? 'text-coral' : 'text-teal')}>[{l.t}] {l.msg}</div>
            ))}
          </div>
        </section>

        <section className="py-10 border-b border-white/10">
          <span className="font-mono text-xs text-amber tracking-wider">Hardware</span>
          <h2 className="font-display text-xl font-semibold mt-1 mb-2">Esquema eletrônico</h2>
          <p className="text-sand-dim text-[15px] max-w-xl mb-6">Mapa de conexões do protótipo. Os fios se iluminam no alerta de perímetro ou na coleta de eDNA.</p>
          <Schematic alert={alert} pumping={pumping} />
          <p className="font-mono text-[11px] text-mist mt-4">
            Diagrama completo:{' '}
            <a href="https://github.com/banana-eletrizante/blue-brilliant/blob/main/firmware/diagram.json" target="_blank" rel="noreferrer" className="text-teal underline">diagram.json</a>
            {' · '}Importe em{' '}
            <a href="https://wokwi.com/projects/new/esp32" target="_blank" rel="noreferrer" className="text-teal underline">wokwi.com</a>
          </p>
        </section>

        <section className="py-10 border-b border-white/10">
          <span className="font-mono text-xs text-amber tracking-wider">Firmware</span>
          <h2 className="font-display text-xl font-semibold mt-1 mb-2">Ciclo de operação</h2>
          <p className="text-sand-dim text-[15px] max-w-xl mb-6">A cada ~3 segundos o ESP32 executa este ciclo autônomo.</p>
          <Flowchart />
        </section>

        <section className="py-10">
          <span className="font-mono text-xs text-amber tracking-wider">Entregáveis</span>
          <h2 className="font-display text-xl font-semibold mt-1 mb-2">Arquivos do projeto</h2>
          <p className="text-sand-dim text-[15px] max-w-xl mb-6">Firmware, circuito Wokwi, relatório e roteiro de pitch.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { name: 'sketch.ino', desc: 'Firmware ESP32 completo', href: 'https://github.com/banana-eletrizante/blue-brilliant/tree/main/firmware' },
              { name: 'diagram.json', desc: 'Circuito para importar no Wokwi', href: 'https://github.com/banana-eletrizante/blue-brilliant/blob/main/firmware/diagram.json' },
              { name: 'relatorio.docx', desc: 'Documento técnico funcional', href: 'https://github.com/banana-eletrizante/blue-brilliant' },
              { name: 'ROTEIRO_PITCH.md', desc: 'Roteiro de fala 3–4 min', href: 'https://github.com/banana-eletrizante/blue-brilliant/blob/main/docs/ROTEIRO_PITCH.md' },
            ].map((f) => (
              <a key={f.name} href={f.href} target="_blank" rel="noreferrer" className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-navy hover:border-teal/50 transition">
                <span className="font-mono text-teal text-xs mt-0.5">↗</span>
                <div>
                  <div className="font-mono text-sm text-sand">{f.name}</div>
                  <div className="font-mono text-[11px] text-sand-dim mt-0.5">{f.desc}</div>
                </div>
              </a>
            ))}
          </div>
          <p className="font-mono text-[11px] text-mist mt-5">
            Simulação neste site = comportamento funcional. Emulação ciclo-a-ciclo do ESP32 como no Wokwi: use o diagram.json no simulador oficial.
          </p>
        </section>
      </main>

      <footer className="border-t border-white/10 px-6 md:px-[6vw] py-8 font-mono text-xs text-mist flex flex-wrap justify-between gap-3">
        <span>Blue Brilliant · Protótipo digital com visualização 3D</span>
        <span>Next.js · React Three Fiber · Parque Tecnológico de Santos</span>
      </footer>
    </div>
  );
}
