# Blue Brilliant — Peixonautas

Boia de monitoramento para delimitar perímetro na água e ajudar na detecção precoce de espécies invasoras.

Três frentes no mesmo equipamento:

1. Sensores de qualidade da água (pH, turbidez, TDS, oxigênio, temperatura)
2. Sonar de perímetro com alerta local (LED + buzzer)
3. Coleta automática de amostra para eDNA (bomba + filtro)

Projeto do grupo **Peixonautas** — Parque Tecnológico de Santos.

## Site

Simulação interativa (3D + sensores + esquema):

https://blue-brilliant.vercel.app

## Firmware (ESP32)

Arquivo principal:

- `firmware/sketch.ino` — leituras, média do sonar, eDNA, log no microSD, WiFi/Adafruit IO
- `firmware/diagram.json` — circuito para importar no [Wokwi](https://wokwi.com/projects/new/esp32)

Bibliotecas usadas no Arduino IDE / Wokwi: TinyGPSPlus, OneWire, DallasTemperature.

## Rodar o site

```bash
npm install
npm run dev
```

## Estrutura

```
app/            Next.js
components/     3D, dashboard, esquema
firmware/       ESP32 + Wokwi
```

Credenciais de WiFi e Adafruit IO ficam no topo do `sketch.ino` — trocar antes de gravar na placa.
