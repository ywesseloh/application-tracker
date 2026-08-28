#!/usr/bin/env bash
# Restore Postgres from a gzipped pg_dump file. Destructive.
#
# Usage:
#   infra/scripts/restore-db.sh --yes /path/to/backup.sql.gz
#   infra/scripts/restore-db.sh --yes --from-oci prod/2026-08-28T03-00-00Z.sql.gz

set -euo pipefail

# shellcheck source=lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

usage() {
  cat <<'EOF'
Restore Postgres from a gzipped logical backup.

Usage:
  infra/scripts/restore-db.sh --yes <backup.sql.gz>
  infra/scripts/restore-db.sh --yes --from-oci <object-name>

Options:
  --yes         Required confirmation (this overwrites existing data)
  --from-oci    Download the object from OCI before restoring

Examples:
  infra/scripts/restore-db.sh --yes ../backups/2026-08-28T03-00-00Z.sql.gz
  infra/scripts/restore-db.sh --yes --from-oci prod/2026-08-28T03-00-00Z.sql.gz
EOF
}

CONFIRMED=0
FROM_OCI=0
BACKUP_FILE=""

for arg in "$@"; do
  case "$arg" in
    --help|-h)
      usage
      exit 0
      ;;
    --yes)
      CONFIRMED=1
      ;;
    --from-oci)
      FROM_OCI=1
      ;;
    --*)
      die "unknown option: $arg"
      ;;
    *)
      [[ -z "$BACKUP_FILE" ]] || die "unexpected extra argument: $arg"
      BACKUP_FILE="$arg"
      ;;
  esac
done

[[ "$CONFIRMED" -eq 1 ]] || die "pass --yes to confirm restore (this overwrites data)"
[[ -n "$BACKUP_FILE" ]] || {
  usage >&2
  exit 1
}

require_docker
load_env_file "$ENV_FILE"
load_backup_config
command -v gzip >/dev/null || die "gzip is required"
require_db_running

if [[ "$FROM_OCI" -eq 1 ]]; then
  "$(dirname "${BASH_SOURCE[0]}")/download-backup.sh" "$BACKUP_FILE"
  BACKUP_FILE="$BACKUP_DIR/$(basename "$BACKUP_FILE")"
fi

[[ -f "$BACKUP_FILE" ]] || die "backup file not found: $BACKUP_FILE"

log "restore start file=$BACKUP_FILE db=${POSTGRES_DB}"

log "stopping backend"
compose stop backend

log "restoring database"
gunzip -c "$BACKUP_FILE" | compose exec -T db psql \
  -v ON_ERROR_STOP=1 \
  -U "${POSTGRES_USER}" \
  -d "${POSTGRES_DB}"

log "starting backend"
compose up -d backend

log "restore complete"
