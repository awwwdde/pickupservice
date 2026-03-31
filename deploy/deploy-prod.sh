#!/usr/bin/env bash
set -euo pipefail

log() {
  printf '[deploy] %s\n' "$*"
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

WORKDIR="${WORKDIR:-/var/www/pickupservice}"
DJANGO_ENV_FILE="${DJANGO_ENV_FILE:-/etc/default/pickupservice.django.env}"

# Vite variables are baked into the build output.
VITE_SITE_URL="${VITE_SITE_URL:-https://pickupservice.moscow}"
VITE_BACKEND_ORIGIN="${VITE_BACKEND_ORIGIN:-https://pickupservice.moscow}"

GITHUB_ACTOR="${GITHUB_ACTOR:-${GITHUB_USERNAME:-}}"
GITHUB_REPO_SLUG="${GITHUB_REPO_SLUG:-}"

require_cmd git
require_cmd npm
require_cmd python3
require_cmd systemctl

cd "$WORKDIR"

if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  [[ -n "$GITHUB_ACTOR" ]] || { echo "Set GITHUB_ACTOR (GitHub username) for HTTPS pull." >&2; exit 1; }

  orig_url="$(git remote get-url origin 2>/dev/null || true)"
  repo_slug="$GITHUB_REPO_SLUG"

  if [[ -z "$repo_slug" ]]; then
    # Try infer "owner/repo" from origin URL.
    # Examples:
    # - https://github.com/owner/repo.git
    # - git@github.com:owner/repo.git
    origin_url="${orig_url#*github.com[:/]}"
    if [[ "$origin_url" =~ ^([^/]+)/([^/]+?)(\.git)?$ ]]; then
      repo_slug="${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
    fi
  fi

  # Нормализуем slug на случай, если туда попал суффикс `.git`
  # (например: `owner/repo.git` -> `owner/repo`), чтобы не получить `...repo.git.git`.
  while [[ -n "$repo_slug" && "$repo_slug" == *.git ]]; do
    repo_slug="${repo_slug%.git}"
  done

  [[ -n "$repo_slug" ]] || { echo "Cannot infer GITHUB_REPO_SLUG; set it explicitly (owner/repo)." >&2; exit 1; }

  cleanup() {
    if [[ -n "${orig_url:-}" ]]; then
      git remote set-url origin "$orig_url" >/dev/null 2>&1 || true
    fi
  }
  trap cleanup EXIT

  auth_url="https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${repo_slug}.git"
  log "Pulling latest code via HTTPS token (origin updated temporarily)"
  git remote set-url origin "$auth_url" >/dev/null
  git pull --ff-only
else
  log "GITHUB_TOKEN not set; running plain git pull"
  git pull
fi

log "Building frontend (Vite)"
export VITE_SITE_URL
export VITE_BACKEND_ORIGIN
npm ci
npm run build

log "Updating backend (Django)"
cd "$WORKDIR/server"
source venv/bin/activate

set -a
# shellcheck disable=SC1090
source "$DJANGO_ENV_FILE"
set +a

pip install -r requirements.txt --quiet

# Playwright: устанавливаем/обновляем браузер если задан PLAYWRIGHT_BROWSERS_PATH
if python -c "import playwright" 2>/dev/null; then
  if [[ -n "${PLAYWRIGHT_BROWSERS_PATH:-}" ]]; then
    log "Installing/updating Playwright Chromium → $PLAYWRIGHT_BROWSERS_PATH"
    PLAYWRIGHT_BROWSERS_PATH="$PLAYWRIGHT_BROWSERS_PATH" playwright install chromium
    chmod -R a+rx "$PLAYWRIGHT_BROWSERS_PATH" 2>/dev/null || true
  else
    log "Playwright installed but PLAYWRIGHT_BROWSERS_PATH not set — skipping browser install"
    log "  To enable Yandex reviews sync, add PLAYWRIGHT_BROWSERS_PATH=/opt/ms-playwright"
    log "  to $DJANGO_ENV_FILE and run: sudo PLAYWRIGHT_BROWSERS_PATH=/opt/ms-playwright playwright install chromium"
  fi
fi

python manage.py migrate
python manage.py collectstatic --noinput

log "Restarting services"
sudo systemctl restart pickupservice
sudo systemctl reload nginx

log "Deploy finished successfully"

