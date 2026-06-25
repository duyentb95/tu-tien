#!/usr/bin/env bash
#
# Mặc Hội Tiên Đồ — Production deploy script
# Build local, rsync dist/ lên VPS, reload nginx.
#
# Usage:
#   ./scripts/deploy.sh                 # full deploy (build + sync + reload)
#   ./scripts/deploy.sh --no-build      # skip npm build (dùng dist/ hiện tại)
#   ./scripts/deploy.sh --check         # dry-run, không sync thực
#   ./scripts/deploy.sh --rollback      # restore từ backup gần nhất
#
# Prerequisites:
#   - Local: node ≥ 20, npm install xong
#   - SSH key đã add vào root@VPS (test: ssh root@91.108.104.135 echo ok)
#   - First-time: chạy ./scripts/setup-vps.sh trước

set -euo pipefail

# ──────────────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────────────
VPS_USER="root"
VPS_HOST="91.108.104.135"
VPS_PATH="/var/www/mac-do"
NGINX_SITE="mac-do"
LOCAL_DIST="dist"
BACKUP_RETENTION=3   # giữ 3 backup gần nhất

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()   { echo -e "${BLUE}▸${NC} $*"; }
ok()    { echo -e "${GREEN}✓${NC} $*"; }
warn()  { echo -e "${YELLOW}⚠${NC} $*"; }
err()   { echo -e "${RED}✗${NC} $*" >&2; }
die()   { err "$*"; exit 1; }

# ──────────────────────────────────────────────────────────────
# Parse args
# ──────────────────────────────────────────────────────────────
DO_BUILD=1
DRY_RUN=0
ROLLBACK=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-build) DO_BUILD=0; shift;;
    --check)    DRY_RUN=1; shift;;
    --rollback) ROLLBACK=1; shift;;
    --help|-h)
      grep -E '^#( |$)' "$0" | sed 's/^# \?//'
      exit 0
      ;;
    *) die "Unknown arg: $1 (use --help)";;
  esac
done

cd "$(dirname "$0")/.."   # chạy từ project root

# ──────────────────────────────────────────────────────────────
# Rollback path
# ──────────────────────────────────────────────────────────────
if [[ $ROLLBACK -eq 1 ]]; then
  log "Rollback từ backup gần nhất trên VPS..."
  ssh "$VPS_USER@$VPS_HOST" bash -s <<EOF
    set -e
    cd "$VPS_PATH"
    LATEST=\$(ls -1 backups/ 2>/dev/null | sort -r | head -1)
    if [[ -z "\$LATEST" ]]; then
      echo "No backup found"
      exit 1
    fi
    echo "Restoring from backups/\$LATEST"
    rm -rf current.broken 2>/dev/null || true
    mv current current.broken 2>/dev/null || true
    cp -r "backups/\$LATEST" current
    nginx -s reload
    echo "Rolled back to \$LATEST"
EOF
  ok "Rollback xong"
  exit 0
fi

# ──────────────────────────────────────────────────────────────
# Pre-flight
# ──────────────────────────────────────────────────────────────
log "Pre-flight check..."

# SSH connectivity
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes "$VPS_USER@$VPS_HOST" 'echo ok' >/dev/null 2>&1; then
  die "Không ssh được vào $VPS_USER@$VPS_HOST. Check SSH key + network."
fi
ok "SSH OK"

# Node version
NODE_VER=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [[ -z "$NODE_VER" || "$NODE_VER" -lt 20 ]]; then
  die "Cần Node ≥ 20 (hiện tại: ${NODE_VER:-không có})"
fi
ok "Node v$NODE_VER"

# ──────────────────────────────────────────────────────────────
# Build
# ──────────────────────────────────────────────────────────────
if [[ $DO_BUILD -eq 1 ]]; then
  log "Type check (build mode -b, check cả vite.config)..."
  npx tsc -b --pretty 2>&1 || die "TypeScript errors — fix trước khi deploy"
  ok "Type check pass"

  log "Run tests..."
  npx vitest run --reporter=dot 2>&1 | tail -5 || die "Tests fail — không deploy"
  ok "Tests pass"

  log "Production build..."
  rm -rf "$LOCAL_DIST" 2>/dev/null || true
  npx vite build || die "Build failed"

  BUNDLE_SIZE=$(du -sh "$LOCAL_DIST" | cut -f1)
  ok "Build done — bundle: $BUNDLE_SIZE"
else
  warn "Skip build (--no-build)"
  [[ -d "$LOCAL_DIST" ]] || die "$LOCAL_DIST không tồn tại"
fi

# ──────────────────────────────────────────────────────────────
# Deploy
# ──────────────────────────────────────────────────────────────
DEPLOY_ID=$(date +'%Y%m%d-%H%M%S')
log "Deploy ID: $DEPLOY_ID"

if [[ $DRY_RUN -eq 1 ]]; then
  warn "DRY RUN — không sync thực"
  rsync -avzn --delete --exclude='.DS_Store' "$LOCAL_DIST/" "$VPS_USER@$VPS_HOST:$VPS_PATH/current.tmp/"
  ok "Dry run done"
  exit 0
fi

log "Rsync → $VPS_USER@$VPS_HOST:$VPS_PATH/releases/$DEPLOY_ID/"
ssh "$VPS_USER@$VPS_HOST" "mkdir -p $VPS_PATH/releases/$DEPLOY_ID $VPS_PATH/backups"
rsync -avz --delete --exclude='.DS_Store' "$LOCAL_DIST/" "$VPS_USER@$VPS_HOST:$VPS_PATH/releases/$DEPLOY_ID/"
ok "Rsync xong"

# Atomic symlink swap + backup
log "Atomic switch + backup current..."
ssh "$VPS_USER@$VPS_HOST" bash -s <<EOF
  set -e
  cd "$VPS_PATH"
  # Backup current nếu có
  if [[ -d current ]]; then
    BACKUP_NAME="backups/\$(date -r current +'%Y%m%d-%H%M%S')"
    cp -r current "\$BACKUP_NAME" 2>/dev/null || true
    # Keep only last $BACKUP_RETENTION backups
    ls -1 backups/ | sort -r | tail -n +$((BACKUP_RETENTION + 1)) | xargs -I{} rm -rf "backups/{}" 2>/dev/null || true
  fi
  rm -rf current
  cp -r "releases/$DEPLOY_ID" current
  # Keep only last 5 releases
  ls -1 releases/ | sort -r | tail -n +6 | xargs -I{} rm -rf "releases/{}" 2>/dev/null || true
  # Reload nginx
  nginx -t && nginx -s reload
  echo "Deploy $DEPLOY_ID active"
EOF

ok "Deploy thành công — release $DEPLOY_ID active"
echo ""
log "Verify:"
echo "  http://$VPS_HOST/"
echo "  ssh $VPS_USER@$VPS_HOST 'tail -f /var/log/nginx/mac-do.access.log'"
echo ""
log "Rollback nếu lỗi:"
echo "  ./scripts/deploy.sh --rollback"
