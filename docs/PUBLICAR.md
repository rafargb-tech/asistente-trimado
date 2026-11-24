# Publicar Trimado en App Store y Google Play

Guía para quien publica con su cuenta de desarrollador. El código está listo; lo que falta depende de la cuenta (firma, ficha y envío a revisión).

| | |
|---|---|
| Nombre en la tienda | **Trimado** (propuesta; confirmar disponibilidad) |
| Identificador (bundle ID / applicationId) | `com.soyrgb.trimado` — **confirmar antes de la primera subida; luego no se puede cambiar** |
| Versión | 3.9 (build / versionCode 39) |
| Política de privacidad | https://rafargb-tech.github.io/asistente-trimado/privacy.html |
| Recoge datos | No |
| Permisos | Ubicación «mientras se usa» (solo al pulsar GPS), vibración |
| Idiomas | Español, inglés, francés |
| Categoría sugerida | Deportes (secundaria: Navegación) |
| Edad | 4+ / PEGI 3 · Todos |

---

## 1. Preparar el proyecto (una vez)

Requisitos: Node 20+, Python 3, Git. Para iOS, un Mac con Xcode 16 o posterior. Para Android, Android Studio (trae el JDK 21 y el SDK).

```bash
git clone https://github.com/rafargb-tech/asistente-trimado.git
cd asistente-trimado
npm install
npm run sync        # genera www/ desde src/ y lo copia a ios/ y android/
```

Cada vez que cambie algo en `src/`, repetir `npm run sync` antes de compilar.

### Si hay que cambiar el identificador

Si `com.soyrgb.trimado` no vale para tu cuenta, cámbialo antes de la primera subida en estos tres sitios (o pídeselo a Rafa):

- `capacitor.config.json` → `appId`
- `android/app/build.gradle` → `namespace` y `applicationId` (y mover la carpeta `android/app/src/main/java/com/soyrgb/trimado/` al nuevo paquete)
- Xcode → target App → Signing & Capabilities → Bundle Identifier

---

## 2. iOS (App Store)

1. `npm run ios` abre el proyecto en Xcode.
2. Target **App** → *Signing & Capabilities*: marca *Automatically manage signing* y elige tu **Team**.
3. En [App Store Connect](https://appstoreconnect.apple.com) → *Apps* → **+** → *New App*: plataforma iOS, nombre, idioma principal Español, el bundle ID de arriba y un SKU cualquiera (p. ej. `trimado`).
4. En Xcode: destino *Any iOS Device (arm64)* → *Product* → *Archive* → *Distribute App* → *App Store Connect* → *Upload*.
5. La build aparece en TestFlight en unos minutos. Pruébala en un iPhone (TestFlight interno no necesita revisión).
6. Rellena la ficha (textos abajo), capturas, privacidad y envía a revisión.

Ya resuelto en el proyecto:
- Texto del permiso de ubicación (`NSLocationWhenInUseUsageDescription`).
- Cifrado de exportación: `ITSAppUsesNonExemptEncryption = NO`, así que no pregunta nada al subir.
- Icono de 1024 px sin transparencia y pantalla de arranque.

**Privacidad en App Store Connect** (*App Privacy*): «Data Not Collected». La ubicación se usa solo dentro del teléfono y no se envía a ningún sitio, así que según la definición de Apple no se «recoge».

**iPad**: la app está marcada para iPhone y iPad. Apple pedirá capturas de iPad de 13". Si no queréis publicar en iPad, en Xcode → target App → *General* → *Supported Destinations* quitad iPad antes de archivar.

**Notas para el revisor** (campo *App Review Information → Notes*), útil frente a la regla 4.2:

> Trimado is an offline sail-trim assistant. It works without network. Native features: GPS speed over ground compared to the boat's polar (tap "GPS" next to the speed field), keep-screen-awake while sailing (phone icon at the top), read-aloud of the trim and checklists in Spanish, English and French with bundled offline neural voice recordings (speaker icon next to each title), haptic feedback on checklists. No account or login required.

---

## 3. Android (Google Play)

1. `npm run android` abre el proyecto en Android Studio.
2. *Build* → *Generate Signed App Bundle or APK* → **Android App Bundle** → crea una *upload key* nueva (guárdala bien con su contraseña; **no la subas al repositorio**) → variante `release`.
3. Sale `android/app/release/app-release.aab`.
4. En [Play Console](https://play.google.com/console) → *Crear app*: nombre, idioma Español, App, Gratis.
5. Activa *Play App Signing* (por defecto) y sube el `.aab` a **Prueba interna** primero.
6. Completa *Contenido de la app* y la ficha, y pasa a producción.

**Cuentas personales creadas después de noviembre de 2023**: Google exige una prueba cerrada con al menos 12 testers durante 14 días seguidos antes de poder publicar en producción. Si es tu caso, sube la build a *Prueba cerrada* cuanto antes. Las cuentas de organización no tienen este requisito.

**Seguridad de los datos** (*Data safety*):
- ¿Recoge o comparte datos? **No**.
- La ubicación se procesa solo en el dispositivo y no se envía, así que no cuenta como recogida.
- Cifrado en tránsito: no aplica (no hay transmisión).
- Eliminación de datos: no aplica (no hay cuenta).

**Otras respuestas de *Contenido de la app***: sin anuncios; sin compras; público objetivo 18+ (o 13+); no es app de noticias ni de salud; acceso sin credenciales (no hay login).

Target API: 36 (cumple el mínimo actual de Google). minSdk 24 (Android 7).

---

## 4. Textos de la ficha

### Español
**Subtítulo / descripción corta (≤ 30 / 80 caracteres)**
Trimado de velas paso a paso
Ajusta tus velas según el viento y tu barco, y sabe qué hacer cuando vas sufriendo.

**Descripción**
Trimado te dice cómo ajustar las velas para el viento que tienes y el barco que llevas.

- Elige el ángulo del viento aparente y su fuerza y te da el ajuste de mayor y génova: escotas, carro, escotero, contra, pujamen, cunningham y driza.
- Lee las lanitas: marca cómo vuelan y te dice qué corregir.
- «¿Qué te pasa?»: escribe «con 15 nudos me voy de orzada» y te da una lista de cambios en orden, hasta tomar rizos.
- Ficha de tu barco: eslora y aparejo, y una polar estimada para saber si vas a la velocidad que toca. Con el GPS compara tu velocidad real.
- «Cómo se hace»: esquemas de cada maniobra.
- Lectura en voz alta del trimado y de la checklist, paso a paso, para no soltar el timón.
- Funciona sin conexión, con pantalla siempre encendida y modo noche.
- Sin cuentas, sin anuncios y sin recoger datos.

**Palabras clave (App Store, ≤ 100 caracteres)**
vela,trimado,regata,velero,navegación,lanitas,rizos,génova,mayor,polar,crucero

### English
**Subtitle / short description**
Step-by-step sail trim
Trim your sails for the wind and your boat, and know what to do when you're overpowered.

**Description**
Trimado tells you how to set your sails for the wind you have and the boat you sail.

- Pick the apparent wind angle and strength and get the trim for main and genoa: sheets, traveller, car, vang, outhaul, cunningham and halyard.
- Read your telltales: tap how they fly and see what to fix.
- "What's wrong?": type "15 knots and I keep rounding up" and get an ordered list of changes, up to reefing.
- Your boat: length and rig, plus an estimated polar to check your speed. Compare with your real GPS speed.
- "How to": diagrams for each adjustment.
- Read-aloud of the trim and the checklist, step by step, so you keep your hands on the helm.
- Works offline, keeps the screen on, night mode.
- No accounts, no ads, no data collected.

**Keywords**
sailing,sail trim,regatta,sailboat,telltales,reefing,genoa,mainsail,polar,cruising,yacht

### Français
**Sous-titre / description courte**
Réglage des voiles pas à pas
Règle tes voiles selon le vent et ton bateau, et sache quoi faire quand ça devient dur.

**Description**
Trimado t'indique comment régler tes voiles pour le vent du moment et ton bateau.

- Choisis l'angle et la force du vent apparent : réglages de grand-voile et génois (écoutes, chariot, hale-bas, bordure, cunningham, drisse).
- Lis tes penons : indique comment ils volent et vois quoi corriger.
- « Qu'est-ce qui ne va pas ? » : écris « 15 nœuds et je pars au lof » et obtiens une liste de changements dans l'ordre, jusqu'à la prise de ris.
- Ton bateau : longueur et gréement, avec une polaire estimée. Compare avec ta vitesse GPS.
- « Comment faire » : schémas pour chaque réglage.
- Lecture à voix haute du réglage et de la checklist, étape par étape, sans lâcher la barre.
- Fonctionne hors ligne, écran toujours allumé, mode nuit.
- Sans compte, sans pub, sans collecte de données.

---

## 5. Capturas

- iPhone 6,9" (1320 × 2868) y, si se publica en iPad, iPad 13" (2064 × 2752).
- Android: al menos 2 capturas de teléfono (1080 × 1920 o mayor) y un gráfico destacado de 1024 × 500.
- Sugerencia de 4 pantallas: Trimado con el dial · Lanitas · «¿Qué te pasa?» con la lista · «Cómo se hace».

Rafa puede generarlas desde la versión web en los tamaños exactos si se las pides.

---

## 6. Nuevas versiones

1. Cambiar «Prototipo vX.Y» en `src/head.html` (la app toma la versión de ahí).
   Si cambian textos que se leen en voz alta: `node tools/voice-corpus.js` y `python3 tools/voice.py` (regenera solo los audios nuevos en `voice/`).
2. Subir `versionCode` y `versionName` en `android/app/build.gradle`, y *Version* y *Build* en Xcode.
3. `npm run sync`, compilar y subir igual que arriba.

## Estructura

```
src/                 código de la app (HTML, CSS, JS, textos)
tools/build.py       genera la web, el artifact y www/ para nativo
www/                 salida para Capacitor (no se versiona)
android/  ios/       proyectos nativos
assets/              icono y splash de origen (npx capacitor-assets generate)
privacy.html         política de privacidad publicada en GitHub Pages
voice/               audios pregrabados (voces Piper davefx/joe CC0, SIWIS CC BY 4.0)
```
