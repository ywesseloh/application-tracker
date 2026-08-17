#!/usr/bin/env bash
# Recurring production deploy: pull git, rebuild Compose, prune dangling images.
#
# Usage (from any cwd; safe for cron):
#   /path/to/repo/docker/deploy.sh
#   /path/to/repo/docker/deploy.sh --force
#
# Env:
#   DEPLOY_BRANCH  Branch to fast-forward (default: current branch, else main)
#   ENV_FILE       Compose env file (default: docker/.env.prod)
#
# Cron example (hourly):
#   0 * * * * /opt/application-tracker/docker/deploy.sh >> /var/log/application-tracker-deploy.log 2>&1

set -euo pipefail

usage() {
  cat <<'EOF'
Recurring production deploy: pull git, rebuild Compose, prune dangling images.

Usage:
  docker/deploy.sh
  docker/deploy.sh --force

Env:
  DEPLOY_BRANCH  Branch to fast-forward (default: current branch, else main)
  ENV_FILE       Compose env file (default: docker/.env.prod)
EOF
}

FORCE=0
for arg in "$@"; do
  case "$arg" in
    --force|-f) FORCE=1 ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      usage >&2
      exit 1
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${ENV_FILE:-$SCRIPT_DIR/.env.prod}"

log() {
  printf '%s %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*"
}

die() {
  log "error: $*" >&2
  exit 1
}

command -v git >/dev/null || die "git is required"
command -v docker >/dev/null || die "docker is required"
docker compose version >/dev/null 2>&1 || die "docker compose is required"
[[ -f "$ENV_FILE" ]] || die "missing env file: $ENV_FILE (copy docker/.env.prod.example)"

cd "$REPO_ROOT"

if [[ -n "${DEPLOY_BRANCH:-}" ]]; then
  BRANCH="$DEPLOY_BRANCH"
else
  BRANCH="$(git rev-parse --abbrev-ref HEAD)"
  if [[ "$BRANCH" == "HEAD" ]]; then
    BRANCH="main"
  fi
fi

log "repo=$REPO_ROOT branch=$BRANCH env=$ENV_FILE force=$FORCE"

git fetch --prune origin "$BRANCH"

LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse "refs/remotes/origin/$BRANCH")"

if [[ "$LOCAL" == "$REMOTE" && "$FORCE" -eq 0 ]]; then
  log "already up to date ($LOCAL); nothing to deploy"
  exit 0
fi

if [[ "$LOCAL" != "$REMOTE" ]]; then
  git merge --ff-only "origin/$BRANCH"
  log "updated $(git rev-parse --short HEAD)"
else
  log "no git changes; rebuilding anyway (--force)"
fi

cd "$SCRIPT_DIR"

log "pulling images"
docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  --env-file "$ENV_FILE" \
  pull

log "building and starting stack"
docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  --env-file "$ENV_FILE" \
  up -d --build --remove-orphans

log "pruning dangling images"
docker image prune -f

log "deploy complete"
docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  --env-file "$ENV_FILE" \
  ps
