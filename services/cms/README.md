# CMS de COPTV (Strapi 5)

Panel donde el equipo de COPTV carga programas, películas, episodios y señales en vivo, y arma la portada.

```bash
cp .env.example .env     # completar las claves (ver abajo)
npm install
npm run develop          # panel en http://localhost:1337/admin
```

Para ver contenido de ejemplo en una base vacía: `CMS_SEED_EXAMPLE=true npm run develop`.

## Tipos de contenido

- **Contenido:** título, slug (identificador en las apps), tipo (`live`, `movie`, `series`, `episode`, `clip`), descripción, acceso (`free`, `registered`, `premium`), géneros separados por coma, imágenes horizontal (16:9) y vertical (2:3), duración, año, clasificación, serie/temporada/episodio, `bunnyVideoId` (GUID del video en Bunny Stream) y `urlVivo` (para señales en vivo).
- **Portada:** lista ordenada de carriles (título, estilo `hero`/`landscape`/`poster`/`live` y contenidos).

Solo se muestra lo publicado.

## Conectar la API

En Strapi: Configuración > API Tokens > crear uno de tipo **Read-only**. En `services/api/.env`:

```
CMS_URL=http://localhost:1337
CMS_TOKEN=<token>
```

## Producción

Usar PostgreSQL (`DATABASE_CLIENT=postgres` y los `DATABASE_*`) y generar claves nuevas para `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET` y `ENCRYPTION_KEY`.
