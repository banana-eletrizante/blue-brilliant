'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import clsx from 'clsx';
import Schematic from './Schematic';

const BuoyScene = dynamic(() => import('./BuoyScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[440px] md:h-[540px] rounded-xl bg-[#040e18] border border-white/10 flex items-center justify-center">
      <span className="font-mono text-sm text-white/40 animate-pulse">Carregando 3D...</span>
    </div>
  ),
});

type Preset = 'normal' | 'poluida' | 'algas' | 'acida';
type Tab = 'sim' | 'schema';
type LogLine = { t: string; msg: string; warn: boolean };
type Sample = { t: string; dist: number; ph: number; turb: number; tds: number; od: number; temp: number; alert: boolean };

const PRESETS: Record<Preset, { ph: number; turb: number; tds: number; od: number; temp: number; label: string }> = {
  normal:  { ph: 7.2, turb: 12,  tds: 180, od: 7.5, temp: 23.4, label: 'Limpa' },
  poluida: { ph: 6.3, turb: 85,  tds: 520, od: 3.1, temp: 25.1, label: 'Poluida' },
  algas:   { ph: 8.6, turb: 60,  tds: 310, od: 2.4, temp: 27.8, label: 'Algas' },
  acida:   { ph: 4.8, turb: 20,  tds: 210, od: 5.9, temp: 19.6, label: 'Acida' },
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

function useContinuousBuzzer(active: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (active) {
      try {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 880;
        gain.gain.value = 0.06;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        ctxRef.current = ctx;
        oscRef.current = osc;
        gainRef.current = gain;

        let on = true;
        const pulse = setInterval(() => {
          if (!gainRef.current || !ctxRef.current) return;
          on = !on;
          gainRef.current.gain.setTargetAtTime(on ? 0.06 : 0.001, ctxRef.current.currentTime, 0.02);
        }, 250);
        return () => {
          clearInterval(pulse);
          try { osc.stop(); ctx.close(); } catch { /* */ }
          oscRef.current = null;
          gainRef.current = null;
          ctxRef.current = null;
        };
      } catch {
        return;
      }
    } else {
      try { oscRef.current?.stop(); ctxRef.current?.close(); } catch { /* */ }
      oscRef.current = null;
      gainRef.current = null;
      ctxRef.current = null;
    }
  }, [active]);
}

function LiveCode({
  dist, ph, turb, tds, od, temp, alert, pumping, amostras,
}: {
  dist: number; ph: number; turb: number; tds: number; od: number; temp: number;
  alert: boolean; pumping: boolean; amostras: number;
}) {
  const line = alert ? 'ALERT' : pumping ? 'eDNA' : 'OK';
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0f14] overflow-hidden font-mono text-[11px] leading-relaxed">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/[0.03]">
        <span className="text-white/40">sketch.ino · live</span>
        <span className={clsx('text-[10px] px-2 py-0.5 rounded', alert ? 'bg-coral/20 text-coral' : 'bg-teal/20 text-teal')}>
          {line}
        </span>
      </div>
      <pre className="p-3 overflow-x-auto text-white/70 max-h-[420px] overflow-y-auto">
{`void loop() {
  float dist = lerSonar();       // ${dist} cm
  float ph   = lerPH();          // ${ph.toFixed(2)}
  float turb = lerTurbidez();    // ${Math.round(turb)} NTU
  float tds  = lerTDS();         // ${Math.round(tds)} ppm
  float od   = lerOD();          // ${od.toFixed(1)} mg/L
  float temp = lerTemp();        // ${temp.toFixed(1)} C

  if (dist < PERIMETRO) {        // ${alert ? 'TRUE' : 'false'}
    digitalWrite(LED, HIGH);${alert ? '     // << LED ON' : ''}
    digitalWrite(BUZZER, HIGH);${alert ? '  // << BUZZER' : ''}
    logAlerta(dist);
  } else {
    digitalWrite(LED, LOW);
    digitalWrite(BUZZER, LOW);
  }

  if (horaDeColetar()) {         // amostras: ${amostras}
    acionarBomba(1800);${pumping ? '      // << BOMBA' : ''}
  }

  gravarSD(dist, ph, turb, tds, od, temp);
  enviarWiFi();                  // Adafruit IO
  delay(3000);
}`}
      </pre>
    </div>
  );
}

export default function Dashboard() {
  const [dist, setDist] = useState(120);
  const [ph, setPh] = useState(7.2);
  const [turb, setTurb] = useState(12);
  const [tds, setTds] = useState(180);
  const [od, setOd] = useState(7.5);
  const [temp, setTemp] = useState(23.4);
  const [amostras, setAmostras] = useState(0);
  const [ultimaColeta, setUltimaColeta] = useState('-');
  const [nextCycle, setNextCycle] = useState(60);
  const [pumping, setPumping] = useState(false);
  const [preset, setPreset] = useState<Preset>('normal');
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [tab, setTab] = useState<Tab>('sim');
  const [lat] = useState(-23.9608);
  const [lng] = useState(-46.3336);

  const perimetro = 60;
  const alert = dist < perimetro;

  useContinuousBuzzer(alert);

  const addLog = useCallback((msg: string, warn = false) => {
    const t = new Date().toLocaleTimeString('pt-BR');
    setLogs((prev) => [{ t, msg, warn }, ...prev].slice(0, 12));
  }, []);

  const prevAlert = useRef(false);
  useEffect(() => {
    if (alert && !prevAlert.current) addLog('ALERTA perimetro', true);
    if (!alert && prevAlert.current) addLog('Perimetro livre');
    prevAlert.current = alert;
  }, [alert, addLog]);

  const coletar = useCallback(() => {
    if (pumping) return;
    setPumping(true);
    addLog('Bomba eDNA - coletando');
    setTimeout(() => {
      setAmostras((n) => n + 1);
      setUltimaColeta(new Date().toLocaleTimeString('pt-BR'));
      setPumping(false);
      addLog('Filtro eDNA pronto');
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
      setPh((v) => clamp(v + (Math.random() - 0.5) * 0.05, 0, 14));
      setTurb((v) => clamp(v + (Math.random() - 0.5) * 1.2, 0, 200));
      setTds((v) => clamp(v + (Math.random() - 0.5) * 3, 0, 800));
      setOd((v) => clamp(v + (Math.random() - 0.5) * 0.12, 0, 12));
      setTemp((v) => clamp(v + (Math.random() - 0.5) * 0.08, 5, 40));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const t = new Date().toLocaleTimeString('pt-BR');
      setSamples((prev) =>
        [{ t, dist, ph, turb, tds, od, temp, alert: dist < perimetro }, ...prev].slice(0, 200)
      );
      addLog(`d=${dist}cm pH=${ph.toFixed(1)} turb=${Math.round(turb)}`, dist < perimetro);
    }, 5000);
    return () => clearInterval(id);
  }, [dist, ph, turb, tds, od, temp, addLog]);

  useEffect(() => { addLog('Sistema online'); }, [addLog]);

  const applyPreset = (key: Preset) => {
    const p = PRESETS[key];
    setPreset(key);
    setPh(p.ph); setTurb(p.turb); setTds(p.tds); setOd(p.od); setTemp(p.temp);
    addLog(`Cenario: ${p.label.toLowerCase()}`);
  };

  const resetAll = () => {
    setLogs([]);
    setSamples([]);
    setAmostras(0);
    setUltimaColeta('-');
    setNextCycle(60);
    setDist(120);
    applyPreset('normal');
    addLog('Reset completo');
  };

  const exportCsv = () => {
    const header = 'time,dist_cm,ph,turb_ntu,tds_ppm,od_mgL,temp_C,alert\n';
    const rows = samples
      .map((s) => `${s.t},${s.dist},${s.ph.toFixed(2)},${s.turb.toFixed(1)},${s.tds.toFixed(0)},${s.od.toFixed(2)},${s.temp.toFixed(1)},${s.alert ? 1 : 0}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blue-brilliant-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addLog(`CSV exportado (${samples.length} linhas)`);
  };

  const metrics = [
    { label: 'Dist', value: `${dist}`, unit: 'cm', pct: pct(dist, 0, 200), color: alert ? 'bg-coral' : 'bg-teal' },
    { label: 'pH', value: ph.toFixed(2), unit: '', pct: pct(ph, 0, 14), color: barColor(ph, 4, [6.5, 8.5], 10) },
    { label: 'Turb', value: `${Math.round(turb)}`, unit: 'NTU', pct: pct(turb, 0, 100), color: barColor(turb, 0, [0, 40], 100) },
    { label: 'TDS', value: `${Math.round(tds)}`, unit: 'ppm', pct: pct(tds, 0, 600), color: barColor(tds, 0, [0, 400], 600) },
    { label: 'O2', value: od.toFixed(1), unit: 'mg/L', pct: pct(od, 0, 10), color: barColor(od, 0, [4, 10], 10) },
    { label: 'Temp', value: temp.toFixed(1), unit: 'C', pct: pct(temp, 10, 35), color: 'bg-teal' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/10 px-4 sm:px-6 lg:px-10 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-teal/20 border border-teal/40 flex items-center justify-center shrink-0">
            <span className="font-mono text-teal text-xs font-bold">BB</span>
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-base sm:text-lg font-semibold text-sand truncate">Blue Brilliant</h1>
            <p className="font-mono text-[10px] text-white/40 hidden sm:block">Monitoramento · perimetro · eDNA</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <nav className="flex gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10">
            <button onClick={() => setTab('sim')} className={clsx('font-mono text-[11px] px-2.5 py-1.5 rounded-md transition', tab === 'sim' ? 'bg-teal text-navy-deep font-medium' : 'text-white/50 hover:text-sand')}>Simulacao</button>
            <button onClick={() => setTab('schema')} className={clsx('font-mono text-[11px] px-2.5 py-1.5 rounded-md transition', tab === 'schema' ? 'bg-teal text-navy-deep font-medium' : 'text-white/50 hover:text-sand')}>Esquema + Codigo</button>
          </nav>
          <div className={clsx('font-mono text-[11px] flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border', alert ? 'border-coral/60 text-coral' : 'border-white/10 text-white/50')}>
            <span className={clsx('w-1.5 h-1.5 rounded-full', alert ? 'bg-coral animate-pulse' : 'bg-teal')} />
            {alert ? 'Alerta' : 'OK'}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-5">
        {tab === 'sim' && (
          <div className="grid lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7">
              <BuoyScene alert={alert} pumping={pumping} dist={dist} />
            </div>
            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-xl overflow-hidden">
                {metrics.map((m) => (
                  <div key={m.label} className="bg-navy-deep p-3">
                    <div className="font-mono text-[10px] text-white/40 uppercase">{m.label}</div>
                    <div className="font-mono text-lg font-medium text-sand mt-0.5">{m.value}{m.unit && <span className="text-[11px] text-white/35 ml-0.5">{m.unit}</span>}</div>
                    <div className="h-0.5 bg-white/10 mt-2 rounded overflow-hidden"><div className={clsx('h-full', m.color)} style={{ width: `${m.pct}%` }} /></div>
                  </div>
                ))}
              </div>

              <div className="border border-white/10 rounded-xl p-4 bg-navy/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-[11px] text-amber">Sonar · {perimetro} cm</span>
                  <span className="font-mono text-sm text-sand">{dist} cm</span>
                </div>
                <input type="range" min={10} max={200} value={dist} onChange={(e) => setDist(Number(e.target.value))} className="w-full" />
                <p className={clsx('font-mono text-[11px] mt-2', alert ? 'text-coral' : 'text-white/40')}>{alert ? 'Alerta — LED + buzzer continuo' : 'Perimetro livre'}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="border border-white/10 rounded-xl p-4 bg-navy/50">
                  <span className="font-mono text-[11px] text-amber block mb-2">Agua</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(PRESETS) as Preset[]).map((key) => (
                      <button key={key} onClick={() => applyPreset(key)} className={clsx('font-mono text-[11px] px-2.5 py-1 rounded border transition', preset === key ? 'border-teal text-teal bg-teal/10' : 'border-white/10 text-white/45 hover:text-sand')}>{PRESETS[key].label}</button>
                    ))}
                  </div>
                </div>
                <div className="border border-white/10 rounded-xl p-4 bg-navy/50">
                  <span className="font-mono text-[11px] text-amber block mb-2">eDNA</span>
                  <div className="font-mono text-[11px] text-white/50 space-y-1 mb-3">
                    <div>Amostras: <span className="text-sand">{amostras}</span></div>
                    <div>Ultima: <span className="text-sand">{ultimaColeta}</span></div>
                    <div>Proxima: <span className="text-sand">{nextCycle}s</span></div>
                  </div>
                  <button onClick={coletar} disabled={pumping} className="w-full font-mono text-[12px] bg-teal text-navy-deep font-medium py-2 rounded-md disabled:opacity-40">{pumping ? 'Filtrando...' : 'Coletar'}</button>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={exportCsv} className="flex-1 font-mono text-[11px] py-2 rounded-md border border-white/10 text-white/60 hover:text-sand hover:border-teal/40 transition">Export CSV ({samples.length})</button>
                <button onClick={resetAll} className="font-mono text-[11px] px-3 py-2 rounded-md border border-white/10 text-white/50 hover:text-coral hover:border-coral/40 transition">Reset</button>
              </div>

              <div className="border border-white/10 rounded-xl p-3 bg-navy-deep font-mono text-[11px] max-h-28 overflow-y-auto flex-1">
                {logs.map((l, i) => (<div key={i} className={clsx('py-0.5', l.warn ? 'text-coral' : 'text-teal/80')}>[{l.t}] {l.msg}</div>))}
              </div>
              <p className="font-mono text-[10px] text-white/30">{lat.toFixed(4)}, {lng.toFixed(4)} · Santos</p>
            </div>
          </div>
        )}

        {tab === 'schema' && (
          <div className="grid lg:grid-cols-2 gap-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-semibold text-sand">Esquema</h2>
                <div className="flex items-center gap-3">
                  <input type="range" min={10} max={200} value={dist} onChange={(e) => setDist(Number(e.target.value))} className="w-28" title="Sonar" />
                  <span className={clsx('font-mono text-[11px]', alert ? 'text-coral' : 'text-white/40')}>{dist} cm</span>
                </div>
              </div>
              <Schematic alert={alert} pumping={pumping} />
              <div className="mt-3 flex gap-2">
                <button onClick={coletar} disabled={pumping} className="font-mono text-[11px] px-3 py-1.5 rounded-md bg-teal/20 text-teal border border-teal/30 disabled:opacity-40">{pumping ? 'Bomba...' : 'Testar eDNA'}</button>
              </div>
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-sand mb-3">Codigo ao vivo</h2>
              <LiveCode dist={dist} ph={ph} turb={turb} tds={tds} od={od} temp={temp} alert={alert} pumping={pumping} amostras={amostras} />
              <p className="font-mono text-[10px] text-white/30 mt-2">Valores atualizam com a simulacao · arraste o sonar acima</p>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 px-4 sm:px-6 lg:px-10 py-3 font-mono text-[10px] text-white/30 flex justify-between gap-2">
        <span>Blue Brilliant · Santos</span>
        <span className="hidden sm:inline">Next.js · R3F</span>
      </footer>
    </div>
  );
}
