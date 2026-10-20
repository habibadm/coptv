# Subidor del NAS a Bunny

Vigila una carpeta del NAS y sube a Bunny Stream cada video nuevo. Bunny lo convierte a varias calidades (HLS) y lo entrega por su CDN. Los originales quedan en el NAS.

- Revisa la carpeta cada `SCAN_INTERVAL_SEC` segundos, incluidas las subcarpetas.
- Solo sube un archivo cuando no cambió durante `STABLE_SEC` segundos, para no subir copias a medias.
- Recuerda lo subido en `/data/estado.json`. Si un archivo cambia, lo vuelve a subir como video nuevo.
- Ignora carpetas de sistema del NAS (`@eaDir`, `@Recycle`, `#recycle`, `.snapshot`).
- Si Bunny falla, reintenta en la próxima pasada.
- Opcional: con `CMS_URL` y `CMS_WRITE_TOKEN` crea un **borrador** en el CMS con el `bunnyVideoId`. El equipo completa título, imágenes y portada, y lo publica.

## Instalación

Funciona en cualquier NAS con Docker: Asustor (Portainer o Docker CE), QNAP (Container Station) o TrueNAS SCALE (Apps > Custom App).

1. Copiar esta carpeta al NAS.
2. Editar `docker-compose.yml`: claves de Bunny y las rutas de las carpetas.
3. Levantarlo: `docker compose up -d --build` (o crear el "stack" desde Portainer/Container Station con el mismo archivo).
4. Ver lo que hace: `docker compose logs -f`.

El token del CMS se crea en Strapi > Configuración > API Tokens, de tipo **Custom** con permiso solo para `create` en Contenido.

## Desarrollo

```bash
npm test
WATCH_DIR=./videos STATE_FILE=./estado.json BUNNY_LIBRARY_ID=... BUNNY_STREAM_API_KEY=... npm start
```
