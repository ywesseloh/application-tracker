#!/usr/bin/env bash
# Upload a local backup file to OCI Object Storage.
#
# Usage:
#   infra/scripts/upload-backup.sh backups/2026-08-28T03-00-00Z.sql.gz
#   infra/scripts/upload-backup.sh --latest

set -euo pipefail

# shellcheck source=lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

usage() {
  cat <<'EOF'
Upload a local backup file to OCI Object Storage.

Usage:
  infra/scripts/upload-backup.sh <backup.sql.gz>
  infra/scripts/upload-backup.sh --latest

Examples:
  infra/scripts/upload-backup.sh backups/2026-08-28T03-00-00Z.sql.gz
  infra/scripts/upload-backup.sh --latest

Requires OCI_BUCKET in infra/scripts/backup.env (or env).
EOF
}

load_backup_config
command -v oci >/dev/null || die "oci CLI is required"
[[ -n "$OCI_BUCKET" ]] || die "OCI_BUCKET is required"

LOCAL_FILE=""
for arg in "$@"; do
  case "$arg" in
    --help|-h)
      usage
      exit 0
      ;;
    --latest)
      [[ -d "$BACKUP_DIR" ]] || die "backup directory not found: $BACKUP_DIR"
      LOCAL_FILE="$(find "$BACKUP_DIR" -maxdepth 1 -type f -name '*.sql.gz' -print | sort | tail -n 1)"
      [[ -n "$LOCAL_FILE" ]] || die "no local backup files found in $BACKUP_DIR"
      ;;
    *)
      if [[ -n "$LOCAL_FILE" ]]; then
        die "unexpected extra argument: $arg"
      fi
      LOCAL_FILE="$arg"
      ;;
  esac
done

[[ -n "$LOCAL_FILE" ]] || {
  usage >&2
  exit 1
}

[[ -f "$LOCAL_FILE" ]] || die "backup file not found: $LOCAL_FILE"

OBJECT_NAME="${OCI_PREFIX}/$(basename "$LOCAL_FILE")"
log "uploading bucket=$OCI_BUCKET object=$OBJECT_NAME file=$LOCAL_FILE"

UPLOAD_ARGS=(
  os object put
  --bucket-name "$OCI_BUCKET"
  --file "$LOCAL_FILE"
  --name "$OBJECT_NAME"
  --force
)
if [[ -n "$OCI_NAMESPACE" ]]; then
  UPLOAD_ARGS+=(--namespace "$OCI_NAMESPACE")
fi

oci "${UPLOAD_ARGS[@]}"
log "upload complete object=$OBJECT_NAME"
