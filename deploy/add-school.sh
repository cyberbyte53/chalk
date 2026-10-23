#!/bin/sh
# From your Mac: add a school on the box and print its code.  pnpm add-school "School name"
set -eu
HOST="${CHALK_HOST:-chalk1}"
[ $# -gt 0 ] || { echo 'Usage: pnpm add-school "School name"'; exit 1; }
# The name goes over ssh's input, so no quoting can break it.
printf '%s' "$*" | ssh "$HOST" 'cd chalk && export NAME="$(cat)" && sg docker -c "docker compose --env-file .env -f deploy/compose.yml exec -T app node_modules/.bin/tsx --tsconfig ../../tsconfig.base.json src/cli.ts add-school \"\$NAME\""'
