#!/usr/bin/env bash
# Shared helpers for infra/scripts/*.sh

set -euo pipefail

SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "$SCRIPTS_DIR/.." && pwd)"
DOCKER_DIR="${DOCKER_DIR:-$INFRA_DIR/docker}"
REPO_ROOT="$(cd "$INFRA_DIR/.." && pwd)"

ENV_FILE="${ENV_FILE:-$DOCKER_DIR/.env.prod}"
BACKUP_CONFIG="${BACKUP_CONFIG:-$SCRIPTS_DIR/backup.env}"

log() {
  printf '%s %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*"
}

die() {
  log "error: $*" >&2
  exit 1
}

load_env_file() {
  local file="$1"
  [[ -f "$file" ]] || die "missing env file: $file"

  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      export "${BASH_REMATCH[1]}=${BASH_REMATCH[2]}"
    fi
  done <"$file"
}

load_backup_config() {
  BACKUP_DIR="${BACKUP_DIR:-$REPO_ROOT/backups}"
  RETAIN_LOCAL_DAYS="${RETAIN_LOCAL_DAYS:-7}"
  OCI_UPLOAD="${OCI_UPLOAD:-0}"
  OCI_BUCKET="${OCI_BUCKET:-}"
  OCI_NAMESPACE="${OCI_NAMESPACE:-}"
  OCI_PREFIX="${OCI_PREFIX:-prod}"

  if [[ -f "$BACKUP_CONFIG" ]]; then
    # shellcheck disable=SC1090
    source "$BACKUP_CONFIG"
  fi
}

require_docker() {
  command -v docker >/dev/null || die "docker is required"
  docker compose version >/dev/null 2>&1 || die "docker compose is required"
  [[ -f "$ENV_FILE" ]] || die "missing env file: $ENV_FILE"
}

compose() {
  docker compose \
    -f "$DOCKER_DIR/docker-compose.yml" \
    -f "$DOCKER_DIR/docker-compose.prod.yml" \
    --env-file "$ENV_FILE" \
    "$@"
}

require_db_running() {
  compose ps --status running --services | grep -qx db || die "db service is not running"
}
