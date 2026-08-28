#!/usr/bin/env bash
# Logical Postgres backup: pg_dump → gzip → local staging → optional OCI upload.
#
# Usage:
#   infra/scripts/backup-db.sh
#
# Optional config: infra/scripts/backup.env (see backup.env.example)

set -euo pipefail

# shellcheck source=lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

usage() {
  cat <<'EOF'
Logical Postgres backup for the production Compose stack.

Usage:
  infra/scripts/backup-db.sh

Optional config file:
  infra/scripts/backup.env
EOF
}

for arg in "$@"; do
  case "$arg" in
    --help|-h)
      usage
      exit 0
      ;;
    *)
      die "unknown argument: $arg (try --help)"
      ;;
  esac
done

require_docker
load_env_file "$ENV_FILE"
load_backup_config

command -v gzip >/dev/null || die "gzip is required"
require_db_running

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

TIMESTAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
BACKUP_FILE="$BACKUP_DIR/${TIMESTAMP}.sql.gz"

log "backup start db=${POSTGRES_DB:-?} file=$BACKUP_FILE"

compose exec -T db pg_dump \
  -U "${POSTGRES_USER}" \
  -d "${POSTGRES_DB}" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  | gzip >"$BACKUP_FILE"

chmod 600 "$BACKUP_FILE"
SIZE="$(du -h "$BACKUP_FILE" | cut -f1)"
log "backup written size=$SIZE"

if [[ "$OCI_UPLOAD" == "1" ]]; then
  "$(dirname "${BASH_SOURCE[0]}")/upload-backup.sh" "$BACKUP_FILE"
fi

"$(dirname "${BASH_SOURCE[0]}")/prune-backups.sh"
log "backup complete"
