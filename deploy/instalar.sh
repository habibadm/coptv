#!/bin/sh
# Instala o actualiza COPTV en este servidor. Se puede ejecutar las veces que haga falta:
#   curl -fsSL https://raw.githubusercontent.com/habibadm/coptv/main/deploy/instalar.sh | sh
# Usa la carpeta actual; ahí quedan .env (claves) y la configuración.
set -eu
REPO=https://raw.githubusercontent.com/habibadm/coptv/main/deploy

if ! docker compose version >/dev/null 2>&1; then
  echo "Falta Docker con Compose. En un Asustor: App Central > Docker Engine." >&2
  exit 1
fi

# Configuración siempre al día; .env solo se crea la primera vez.
for f in docker-compose.yml Caddyfile .env.example; do
  curl -fsSL "$REPO/$f" -o "$f"
done
if [ ! -f .env ]; then
  cp .env.example .env
  chmod 600 .env
  echo "Se creó .env. Revisá APP_DOMAIN y PANEL_DOMAIN y volvé a ejecutar."
fi

aleatorio() { head -c 24 /dev/urandom | od -An -tx1 | tr -d ' \n'; }

# Genera las claves internas que estén vacías.
for clave in DB_PASSWORD API_TOKEN_SALT ADMIN_JWT_SECRET TRANSFER_TOKEN_SALT JWT_SECRET ENCRYPTION_KEY APP_KEYS; do
  if grep -q "^$clave=$" .env; then
    if [ "$clave" = APP_KEYS ]; then valor="$(aleatorio),$(aleatorio)"; else valor="$(aleatorio)"; fi
    sed -i "s|^$clave=$|$clave=$valor|" .env
  fi
done

docker compose pull
docker compose up -d --remove-orphans
docker compose ps
. ./.env
echo
echo "Listo. App: https://$APP_DOMAIN  Panel: https://$PANEL_DOMAIN/admin"
