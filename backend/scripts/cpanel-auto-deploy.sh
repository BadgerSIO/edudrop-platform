#!/usr/bin/env bash
set -euo pipefail

# EduDrop cPanel Auto-Deploy Script (runs via cPanel Cron over outbound HTTPS)
# Syncs the pre-built `deploy-backend` branch into the cPanel Node.js app folder
# without touching `.env` or deleting live uploads, and triggers Passenger restart.

REPO_URL="${REPO_URL:-https://github.com/BadgerSIO/edudrop-platform.git}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-deploy-backend}"
APP_DIR="${APP_DIR:-/home/vvqtbikp/edudrop-api}"
NODE_VENV_ACTIVATE="${NODE_VENV_ACTIVATE:-/home/vvqtbikp/nodevenv/edudrop-api/22/bin/activate}"
NODE_BIN="${NODE_BIN:-/opt/alt/alt-nodejs22/root/usr/bin}"
SHA_FILE="${SHA_FILE:-$HOME/.edudrop-deployed-sha}"
LOG_FILE="${LOG_FILE:-$HOME/edudrop-deploy.log}"
LOCK_DIR="/tmp/edudrop-auto-deploy-${USER:-cpanel}.lock"

# Clear stale lock if a previous run died more than 15 minutes ago
if [ -d "$LOCK_DIR" ] && [ -n "$(find "$LOCK_DIR" -maxdepth 0 -mmin +15 2>/dev/null)" ]; then
  rmdir "$LOCK_DIR" 2>/dev/null || true
fi

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  exit 0
fi

TMP_REPO=""
TMP_NPM_CACHE=""

cleanup() {
  [ -n "$TMP_REPO" ] && rm -rf "$TMP_REPO" 2>/dev/null || true
  [ -n "$TMP_NPM_CACHE" ] && rm -rf "$TMP_NPM_CACHE" 2>/dev/null || true
  rmdir "$LOCK_DIR" 2>/dev/null || true
}
trap cleanup EXIT

REMOTE_SHA="$(git ls-remote --heads "$REPO_URL" "$DEPLOY_BRANCH" 2>/dev/null | awk 'NR==1 {print $1}' || true)"
if [ -z "$REMOTE_SHA" ]; then
  exit 0
fi

LAST_SHA=""
if [ -f "$SHA_FILE" ]; then
  LAST_SHA="$(cat "$SHA_FILE" 2>/dev/null || true)"
fi

if [ "$REMOTE_SHA" = "$LAST_SHA" ]; then
  exit 0
fi

TMP_REPO="$(mktemp -d "$HOME/tmp-edudrop-deploy-XXXXXX")"
TMP_NPM_CACHE="$(mktemp -d "$HOME/tmp-npm-cache-XXXXXX")"

git clone --depth 1 --branch "$DEPLOY_BRANCH" "$REPO_URL" "$TMP_REPO" >>"$LOG_FILE" 2>&1

NEEDS_NPM_INSTALL=0
if [ ! -e "$APP_DIR/node_modules" ] || [ ! -f "$APP_DIR/package-lock.json" ]; then
  NEEDS_NPM_INSTALL=1
elif ! cmp -s "$TMP_REPO/package-lock.json" "$APP_DIR/package-lock.json"; then
  NEEDS_NPM_INSTALL=1
fi

mkdir -p "$APP_DIR/uploads" "$APP_DIR/tmp"
rm -rf "$APP_DIR/dist" "$APP_DIR/seed"
cp -r "$TMP_REPO/dist" "$TMP_REPO/seed" "$TMP_REPO/package.json" "$TMP_REPO/package-lock.json" "$TMP_REPO/app.js" "$APP_DIR/"
cp -ru "$TMP_REPO/uploads/." "$APP_DIR/uploads/"

if [ "$NEEDS_NPM_INSTALL" -eq 1 ]; then
  if [ -f "$NODE_VENV_ACTIVATE" ]; then
    # shellcheck disable=SC1090
    source "$NODE_VENV_ACTIVATE"
  else
    export PATH="$NODE_BIN:$PATH"
  fi
  cd "$APP_DIR"
  npm install --omit=dev --cache "$TMP_NPM_CACHE" --no-audit --no-fund >>"$LOG_FILE" 2>&1
fi

touch "$APP_DIR/tmp/restart.txt"
printf '%s\n' "$REMOTE_SHA" > "$SHA_FILE"

printf '[%s] Deployed %s (npm_install=%s)\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "${REMOTE_SHA:0:7}" "$NEEDS_NPM_INSTALL" >> "$LOG_FILE"
if [ -f "$LOG_FILE" ]; then
  tail -n 200 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
fi
