#!/usr/bin/env bash
# Download a backup object from OCI Object Storage to local staging.
#
# Usage:
#   infra/scripts/download-backup.sh prod/2026-08-28T03-00-00Z.sql.gz
#   infra/scripts/download-backup.sh --latest

set -euo pipefail

# shellcheck source=lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

usage() {
  cat <<'EOF'
Download a backup from OCI Object Storage.

Usage:
  infra/scripts/download-backup.sh <object-name>
  infra/scripts/download-backup.sh --latest

Examples:
  infra/scripts/download-backup.sh prod/2026-08-28T03-00-00Z.sql.gz

Requires OCI_BUCKET in infra/scripts/backup.env (or env).
EOF
}

load_backup_config
command -v oci >/dev/null || die "oci CLI is required"
[[ -n "$OCI_BUCKET" ]] || die "OCI_BUCKET is required"

OBJECT_NAME=""
for arg in "$@"; do
  case "$arg" in
    --help|-h)
      usage
      exit 0
      ;;
    --latest)
      LIST_ARGS=(
        os object list
        --bucket-name "$OCI_BUCKET"
        --prefix "$OCI_PREFIX/"
        --all
        --query 'data[-1].name'
        --raw-output
      )
      if [[ -n "$OCI_NAMESPACE" ]]; then
        LIST_ARGS+=(--namespace "$OCI_NAMESPACE")
      fi
      OBJECT_NAME="$(oci "${LIST_ARGS[@]}")"
      [[ -n "$OBJECT_NAME" && "$OBJECT_NAME" != "null" ]] || die "no backup objects found under ${OCI_PREFIX}/"
      ;;
    *)
      if [[ -n "$OBJECT_NAME" ]]; then
        die "unexpected extra argument: $arg"
      fi
      OBJECT_NAME="$arg"
      ;;
  esac
done

[[ -n "$OBJECT_NAME" ]] || {
  usage >&2
  exit 1
}

mkdir -p "$BACKUP_DIR"
LOCAL_FILE="$BACKUP_DIR/$(basename "$OBJECT_NAME")"

log "downloading bucket=$OCI_BUCKET object=$OBJECT_NAME -> $LOCAL_FILE"

GET_ARGS=(
  os object get
  --bucket-name "$OCI_BUCKET"
  --name "$OBJECT_NAME"
  --file "$LOCAL_FILE"
)
if [[ -n "$OCI_NAMESPACE" ]]; then
  GET_ARGS+=(--namespace "$OCI_NAMESPACE")
fi

oci "${GET_ARGS[@]}"
chmod 600 "$LOCAL_FILE"
log "download complete file=$LOCAL_FILE"
