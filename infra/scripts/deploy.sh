#!/usr/bin/env bash
# Production deploy: rebuild and start the Compose stack from the current checkout.
#
# Usage (from any cwd):
#   /path/to/repo/infra/scripts/deploy.sh
#
# Env:
#   ENV_FILE  Compose env file (default: infra/docker/.env.prod)

set -euo pipefail

# shellcheck source=lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

usage() {
  cat <<'EOF'
Production deploy: pull images, build, and start the Compose stack.

Usage:
  infra/scripts/deploy.sh

Env:
  ENV_FILE  Compose env file (default: infra/docker/.env.prod)
EOF
}

for arg in "$@"; do
  case "$arg" in
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

require_docker

log "deploy start repo=$REPO_ROOT env=$ENV_FILE"

log "pulling images"
compose pull

log "building and starting stack"
compose up -d --build --remove-orphans

log "pruning dangling images"
docker image prune -f

log "deploy complete"
compose ps
