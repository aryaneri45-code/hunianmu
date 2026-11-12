#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
PG_BIN="${PG_BIN:-/usr/lib/postgresql/16/bin}"
PG_DATA="$PWD/storage/pgdata"
mkdir -p storage/pgsocket
if [ ! -f "$PG_DATA/PG_VERSION" ]; then
  "$PG_BIN/initdb" -D "$PG_DATA" -A trust --username=hunianmu --no-locale -E UTF8 >/dev/null
fi
if ! "$PG_BIN/pg_ctl" -D "$PG_DATA" status >/dev/null 2>&1; then
  "$PG_BIN/pg_ctl" -D "$PG_DATA" -l "$PWD/storage/postgres.log" -o "-p 55432 -k $PWD/storage/pgsocket -h 127.0.0.1" start
fi
HM_DATABASE_EXISTS="$("$PG_BIN/psql" -X -h 127.0.0.1 -p 55432 -U hunianmu -d postgres -v ON_ERROR_STOP=1 -Atc "SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname='hunianmu')")"
case "$HM_DATABASE_EXISTS" in
  t) ;; # Database yang sudah ada tetap dipakai.
  f) "$PG_BIN/createdb" -h 127.0.0.1 -p 55432 -U hunianmu hunianmu ;;
  *)
    printf 'Tidak dapat memastikan status database hunianmu; pembuatan dibatalkan.\n' >&2
    exit 1
    ;;
esac
if [ ! -f .env ]; then
  umask 077
  SESSION_VALUE="$(openssl rand -hex 32)"
  cat > .env <<ENV
NODE_ENV=development
HOST=127.0.0.1
PORT=8821
SITE_URL=http://localhost:8821
DATABASE_URL=postgresql://hunianmu@127.0.0.1:55432/hunianmu
SESSION_KEY=$SESSION_VALUE
UPLOAD_DIR=storage/uploads
TRUST_PROXY=false
ENV
fi
printf 'PostgreSQL lokal siap di 127.0.0.1:55432; konfigurasi .env dipertahankan.\n'
