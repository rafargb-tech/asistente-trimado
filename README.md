# Asistente de Trimado

Herramienta de trimado de velas para cruceros. Prototipo.

- Trimado de mayor y génova según rumbo, viento y el equipo de tu barco.
- Diagnóstico por lanitas (catavientos).
- Polar estimada a partir de la eslora, calibrada con predicciones VPP de 73 cruceros con certificado ORC (datos públicos de [jieter/orc-data](https://github.com/jieter/orc-data)).
- Checklist escalonado, del ajuste más fino a los rizos.
- Español, inglés y francés. Modo día y noche.
- Se instala en el móvil y funciona sin conexión. No recoge datos: los barcos se guardan en el propio dispositivo.

**Las polares son estimaciones y los umbrales de rizo, orientativos. Si estás pensando en rizar, riza.**

## Estructura

- `src/` código fuente: `head.html` (HTML y CSS), `app.js` (lógica), `i18n.json` (traducciones EN/FR).
- `tools/build.py` genera `index.html` y `sw.js`. Ejecuta `python3 tools/build.py` tras cualquier cambio en `src/`.
- `index.html`, `sw.js`, `manifest.webmanifest`, `icons/`, `fonts/` es lo que publica GitHub Pages.
- Fuentes IBM Plex bajo licencia SIL Open Font License (`fonts/OFL.txt`).

## App nativa (iOS y Android)

Proyecto Capacitor en `android/` e `ios/`. Ver [docs/PUBLICAR.md](docs/PUBLICAR.md) para compilar y publicar. Política de privacidad: [privacy.html](privacy.html).
