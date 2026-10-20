# COPTV

App de streaming (OTT) de COPTV: en vivo y bajo demanda para iOS, Android, Smart TV y consolas.
El plan técnico completo está en el proyecto (`plan/plan-tecnico-app-coptv.md`).

## Estructura

| Carpeta | Qué es | Plataformas |
|---|---|---|
| `apps/mobile` | App React Native (Expo + react-native-tvos) | iOS, Android, Apple TV, Android TV / Google TV |
| `apps/tv-web` | App web para control remoto (React + Vite) | Samsung Tizen, LG webOS, Xbox, PlayStation, navegador |
| `services/api` | API de COPTV (Fastify): lee el CMS o un catálogo de ejemplo | Servidor |
| `services/cms` | Panel de contenido (Strapi 5) | Servidor |
| `services/nas-uploader` | Sube los videos del NAS a Bunny Stream (Docker) | NAS |
| `packages/shared` | Tipos, cliente de la API y reglas de acceso comunes | Todas |

## Cómo correrlo

Requiere Node 22.

```bash
npm install
npm run api      # API en http://localhost:4000
npm run tv       # App de TV en http://localhost:5173 (usar flechas, Enter y Escape)
npm run mobile   # App móvil con Expo (abrir en Expo Go o en un simulador)
npm run cms      # Panel de contenido en http://localhost:1337/admin (antes: npm install --prefix services/cms)
```

Para Apple TV y Android TV: `npm run ios:tv -w @coptv/mobile` o `npm run android:tv -w @coptv/mobile` (genera los proyectos nativos con `EXPO_TV=1`).

En un teléfono físico, cambiar `extra.apiUrl` en `apps/mobile/app.json` por la IP de la computadora.

Verificaciones: `npm run typecheck`, `npm test`, `npm run build`.

## Preparado para cobrar y poner anuncios

- Cada contenido tiene un nivel de acceso (`free`, `registered`, `premium`). Hoy todo es `free`; la regla está en `packages/shared/src/entitlements.ts`.
- La API devuelve pausas publicitarias solo si `ADS_ENABLED=true` (ver `services/api/.env.example`).

## Video con Bunny.net

- **Bajo demanda:** los videos se suben a una librería de Bunny Stream y se reproducen como `https://<pull-zone>/<videoId>/playlist.m3u8`.
- **En vivo:** la señal sale por la CDN de Bunny (Bunny Live está en vista previa cerrada; también sirve cualquier origen HLS detrás de una Pull Zone).
- **Protección:** con `BUNNY_TOKEN_KEY` la API entrega URLs firmadas que vencen, válidas para el manifiesto y sus segmentos.

Configuración en `services/api/.env.example`.

## Marca

Los logos están en `brand/` (horizontal y símbolo, en color y en blanco), sacados del manual de marca de COPTV.
Colores: azul `#4A76CB`, amarillo `#ECB536`, rojo `#D35237`, verde `#529E56`, gris `#E2E2E1`, negro y el rojo del logo `#E43034`.
Tipografías: Barlow (textos) y Barlow Condensed (títulos). El amarillo marca lo que está seleccionado con el control remoto.

## Servidor

Se instala con Docker en el servidor de COPTV (hoy el Asustor): panel, API, app de TV en el navegador y HTTPS. Pasos en `deploy/README.md`.

## Empaquetar para televisores

- **Samsung Tizen:** `npm run build -w @coptv/tv-web`, copiar `apps/tv-web/dist/` junto a `apps/tv-web/platform/tizen/config.xml` y firmar con Tizen Studio.
- **LG webOS:** igual, con `apps/tv-web/platform/webos/appinfo.json` y `ares-package`.

## Próximos pasos

1. Crear la librería de Bunny Stream y conectar la señal real de COPTV con `LIVE_STREAM_URL`.
2. Instalar el subidor en el NAS (`services/nas-uploader/README.md`).
3. Imágenes reales de cada programa en el panel de contenido.
