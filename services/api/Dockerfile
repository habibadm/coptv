# API de COPTV junto con la app de TV para el navegador (misma dirección, sin CORS).
# Se construye desde la raíz del repositorio: docker build -f services/api/Dockerfile .
FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY services/api/package.json services/api/
COPY apps/tv-web/package.json apps/tv-web/
COPY apps/mobile/package.json apps/mobile/
COPY services/nas-uploader/package.json services/nas-uploader/
RUN npm ci --workspace @coptv/api --workspace @coptv/tv-web --workspace @coptv/shared --include-workspace-root
COPY packages/shared packages/shared
COPY services/api services/api
COPY apps/tv-web apps/tv-web
# Sin VITE_API_URL la app pide la API a su misma dirección.
RUN VITE_API_URL= npm run build -w @coptv/tv-web
ENV NODE_ENV=production PORT=4000 WEB_DIR=/app/apps/tv-web/dist
USER node
EXPOSE 4000
CMD ["npm", "run", "start", "-w", "@coptv/api"]
