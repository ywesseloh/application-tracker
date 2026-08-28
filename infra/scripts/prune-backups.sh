#!/usr/bin/env bash
# Delete local backup files older than RETAIN_LOCAL_DAYS.
#
# Usage:
#   infra/scripts/prune-backups.sh

set -euo pipefail

# shellcheck source=lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

load_backup_config

[[ -d "$BACKUP_DIR" ]] || exit 0

find "$BACKUP_DIR" -maxdepth 1 -type f -name '*.sql.gz' -mtime +"$RETAIN_LOCAL_DAYS" -print -delete
