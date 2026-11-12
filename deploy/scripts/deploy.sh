#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
if ! command -v pm2 >/dev/null 2>&1; then
  printf 'PM2 belum terpasang. Ikuti docs/deployment.md sebelum menjalankan rilis.\n' >&2
  exit 1
fi
npm ci
npm run typecheck
npm run lint
npm run build
npm run db:migrate
pm2 startOrReload deploy/pm2.ecosystem.config.cjs --update-env
