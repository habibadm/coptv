# COPTV

App de streaming (OTT) de COPTV: en vivo y bajo demanda para iOS, Android, Smart TV y consolas.
El plan técnico completo está en el proyecto (`plan/plan-tecnico-app-coptv.md`).

## Estructura

| Carpeta | Qué es | Plataformas |
|---|---|---|
| `apps/mobile` | App React Native (Expo) | iOS, Android (después Apple TV y Android TV) |
| `apps/tv-web` | App web para control remoto (React + Vite) | Samsung Tizen, LG webOS, Xbox, PlayStation, navegador |
| `services/api` | API de COPTV (Fastify) con catálogo de ejemplo | Servidor |
| `packages/shared` | Tipos, cliente de la API y reglas de acceso comunes | Todas |

## Cómo correrlo

Requiere Node 22.

```bash
npm install
npm run api      # API en http://localhost:4000
npm run tv       # App de TV en http://localhost:5173 (usar flechas, Enter y Escape)
npm run mobile   # App móvil con Expo (abrir en Expo Go o en un simulador)
```

En un teléfono físico, cambiar `extra.apiUrl` en `apps/mobile/app.json` por la IP de la computadora.

Verificaciones: `npm run typecheck`, `npm test`, `npm run build`.

## Preparado para cobrar y poner anuncios

- Cada contenido tiene un nivel de acceso (`free`, `registered`, `premium`). Hoy todo es `free`; la regla está en `packages/shared/src/entitlements.ts`.
- La API devuelve pausas publicitarias solo si `ADS_ENABLED=true` (ver `services/api/.env.example`).

## Empaquetar para televisores

- **Samsung Tizen:** `npm run build -w @coptv/tv-web`, copiar `apps/tv-web/dist/` junto a `apps/tv-web/platform/tizen/config.xml` y firmar con Tizen Studio.
- **LG webOS:** igual, con `apps/tv-web/platform/webos/appinfo.json` y `ares-package`.

## Próximos pasos

1. Conectar la señal real de COPTV (Mux) con `LIVE_STREAM_URL`.
2. Reemplazar el catálogo de ejemplo por el CMS.
3. Diseño final de marca y pantallas.
