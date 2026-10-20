# Panel de contenido (Strapi). Se construye una vez y queda listo para producción.
FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build && npm prune --omit=dev && mkdir -p public/uploads && chown -R node:node public/uploads
USER node
EXPOSE 1337
CMD ["npm", "run", "start"]
