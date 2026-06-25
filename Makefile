# Mặc Hội Tiên Đồ — Makefile shortcuts
# Cần GNU make. Trên macOS đã có sẵn.

VPS := root@91.108.104.135
VPS_PATH := /var/www/mac-do

.PHONY: help dev build test typecheck lint deploy deploy-dry rollback setup logs ssh clean

help:  ## Show all commands
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[1;34m%-15s\033[0m %s\n", $$1, $$2}'

# ──────────────────────────────────────────────────────────────
# Local dev
# ──────────────────────────────────────────────────────────────
dev:  ## Start vite dev server (http://localhost:5173)
	npm run dev

build:  ## Production build → dist/
	npm run build

test:  ## Run vitest unit tests
	npm run test

typecheck:  ## tsc --noEmit
	npm run typecheck

lint:  ## ESLint
	npm run lint

# ──────────────────────────────────────────────────────────────
# Deploy — VPS (full control, có thể proxy AI sau)
# ──────────────────────────────────────────────────────────────
setup:  ## First-time VPS setup (nginx + firewall)
	@echo "▸ Upload nginx config..."
	scp scripts/nginx-mac-do.conf $(VPS):/tmp/
	@echo "▸ Run setup script on VPS..."
	ssh $(VPS) 'bash -s' < scripts/setup-vps.sh

deploy:  ## Full deploy lên VPS (build + sync + reload nginx)
	./scripts/deploy.sh

deploy-dry:  ## Dry-run deploy VPS (kiểm tra trước khi sync thật)
	./scripts/deploy.sh --check

deploy-fast:  ## Deploy VPS không build lại (dùng dist/ hiện tại)
	./scripts/deploy.sh --no-build

rollback:  ## Rollback VPS về release trước
	./scripts/deploy.sh --rollback

# ──────────────────────────────────────────────────────────────
# Deploy — Netlify (đơn giản nhất, free SSL + CDN)
# ──────────────────────────────────────────────────────────────
netlify-init:  ## First-time: link project vào Netlify (cần Netlify CLI)
	@which netlify >/dev/null || npm install -g netlify-cli
	netlify login
	netlify init

netlify-deploy:  ## Deploy preview lên Netlify (URL random để test)
	@which netlify >/dev/null || npm install -g netlify-cli
	npm run build
	netlify deploy

netlify-prod:  ## Deploy production lên Netlify (URL chính thức)
	@which netlify >/dev/null || npm install -g netlify-cli
	npm run build
	netlify deploy --prod

netlify-open:  ## Mở Netlify dashboard
	netlify open

# ──────────────────────────────────────────────────────────────
# Monitoring
# ──────────────────────────────────────────────────────────────
logs:  ## Tail nginx access + error log trên VPS
	ssh $(VPS) 'tail -f /var/log/nginx/mac-do.access.log /var/log/nginx/mac-do.error.log'

logs-error:  ## Tail chỉ error log
	ssh $(VPS) 'tail -f /var/log/nginx/mac-do.error.log'

ssh:  ## SSH vào VPS
	ssh $(VPS)

status:  ## Check nginx + releases status
	ssh $(VPS) 'systemctl status nginx --no-pager | head -10; echo; echo "Releases:"; ls -lt $(VPS_PATH)/releases/ 2>/dev/null | head -5; echo "Backups:"; ls -lt $(VPS_PATH)/backups/ 2>/dev/null | head -5'

# ──────────────────────────────────────────────────────────────
# Maintenance
# ──────────────────────────────────────────────────────────────
clean:  ## Clean local build artifacts
	rm -rf dist node_modules/.vite

clean-vps:  ## Xóa old releases + backups trên VPS (giữ 2 gần nhất)
	ssh $(VPS) 'cd $(VPS_PATH) && ls -1 releases/ | sort -r | tail -n +3 | xargs -I{} rm -rf "releases/{}"; ls -1 backups/ | sort -r | tail -n +3 | xargs -I{} rm -rf "backups/{}"; echo "Cleaned"'
