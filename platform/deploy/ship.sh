#!/bin/sh
# From your Mac: copy the repo to the box and (re)build and start everything there.
#   pnpm ship                     # to chalk1
#   CHALK_HOST=other pnpm ship    # to another ssh host
# The first time, it also makes the box's .env from yours (production values, a new database
# password); after that the box's .env is never overwritten.
set -eu
HOST="${CHALK_HOST:-chalk1}"
ORIGIN="${CHALK_ORIGIN:-https://chalk1.centralindia.cloudapp.azure.com}"
cd "$(dirname "$0")/../.."

echo "→ copying the repo to $HOST"
rsync -az --delete --exclude-from=platform/deploy/rsync-exclude ./ "$HOST:chalk/"

if ! ssh "$HOST" test -f chalk/.env; then
  echo "→ first time: making the box's .env"
  PASSWORD="$(openssl rand -hex 24)"
  grep -v -E '^(ORIGIN|DATABASE_URL|DEV_SIGN_IN|POSTGRES_PASSWORD|PORT)=' .env |
    { cat; printf 'ORIGIN=%s\nPOSTGRES_PASSWORD=%s\nDEV_SIGN_IN=off\n' "$ORIGIN" "$PASSWORD"; } |
    ssh "$HOST" 'umask 077 && cat > chalk/.env'
fi

if ! ssh "$HOST" command -v docker >/dev/null; then
  echo "→ installing Docker on $HOST"
  ssh "$HOST" sh chalk/platform/deploy/setup-box.sh
fi

echo "→ building and starting on $HOST"
ssh "$HOST" 'cd chalk && sg docker -c "docker compose --env-file .env -f platform/deploy/compose.yml up -d --build --remove-orphans" && sg docker -c "docker image prune -f" >/dev/null'
ssh "$HOST" 'cd chalk && sg docker -c "docker compose --env-file .env -f platform/deploy/compose.yml ps --format \"table {{.Service}}\t{{.Status}}\""'
echo "→ $ORIGIN"
