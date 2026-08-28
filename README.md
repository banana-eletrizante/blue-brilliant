# Blue Brilliant

**Boia inteligente para delimitação de biodiversidade e detecção precoce de espécies invasoras.**

Site interativo com:
- Visualização **3D** da boia (React Three Fiber)
- Simulação em tempo real de sensores (pH, turbidez, TDS, OD, temperatura)
- Sonar de perímetro com alerta visual
- Auto-amostrador de eDNA
- Telemetria simulada

## Stack

- **Next.js 14** (App Router)
- **React Three Fiber** + Drei (3D)
- **Tailwind CSS**
- TypeScript

## Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. **Add New Project** → selecione `blue-brilliant`
3. Framework: Next.js (detectado automaticamente)
4. Deploy

Ou via CLI:

```bash
npx vercel
```

## Projeto

- Firmware ESP32 (`sketch.ino`)
- Circuito Wokwi (`diagram.json`)
- Relatório técnico (`relatorio.docx`)

**Blue Brilliant** · Parque Tecnológico de Santos · 2026
