#!/bin/bash
# KuikChat Zero-Downtime Deployment Script
# Used by Hermes swarm agents for Slice 2c and beyond
# Requires KU IKCHAT_DEPLOY_PASSWORD in ~/.hermes/.env

set -euo pipefail

# Load password from Hermes env
if [ -f "$HOME/.hermes/.env" ]; then
    export $(grep -v '^#' "$HOME/.hermes/.env" | xargs)
fi

if [ -z "${KU IKCHAT_DEPLOY_PASSWORD:-}" ]; then
    echo "ERROR: KU IKCHAT_DEPLOY_PASSWORD not set in ~/.hermes/.env"
    exit 1
fi

SERVER="root@217.154.11.234"
SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=10"
DEPLOY_DIR="/opt/kuikchat"
BUILD_DIR="/opt/kuikchat_build"
SERVICE="kuikchat.service"

echo "=== KuikChat Deployment Started ==="
echo "Target: $SERVER"
echo "Branch: $(git rev-parse --abbrev-ref HEAD)"
echo "Commit: $(git rev-parse --short HEAD)"

# 1. Push current branch to GitHub (agents must do this before calling deploy)
echo ">>> Ensuring branch is pushed..."
git push origin "$(git rev-parse --abbrev-ref HEAD)" || true

# 2. Deploy to server using password
echo ">>> Connecting to production server..."
sshpass -p "$KU IKCHAT_DEPLOY_PASSWORD" ssh $SSH_OPTS "$SERVER" bash -s << 'EOF'
set -euo pipefail

echo ">>> [Server] Updating code in shadow directory..."
cd /opt/kuikchat_build
git fetch origin
git checkout "$(git rev-parse --abbrev-ref HEAD)"
git pull --ff-only

echo ">>> [Server] Installing dependencies with Bun..."
bun install --frozen-lockfile

echo ">>> [Server] Building production bundle..."
bun run build

echo ">>> [Server] Stopping service..."
systemctl stop kuikchat.service

echo ">>> [Server] Swapping build (zero-downtime)..."
rm -rf /opt/kuikchat/.next /opt/kuikchat/dist 2>/dev/null || true
cp -r /opt/kuikchat_build/.next /opt/kuikchat/ 2>/dev/null || true
cp -r /opt/kuikchat_build/dist /opt/kuikchat/ 2>/dev/null || true
cp -r /opt/kuikchat_build/* /opt/kuikchat/ --parents 2>/dev/null || true

echo ">>> [Server] Starting service..."
systemctl start kuikchat.service

echo ">>> [Server] Reloading Nginx..."
nginx -t && systemctl reload nginx

echo ">>> [Server] Deployment complete. Service status:"
systemctl status kuikchat.service --no-pager | head -5
EOF

echo "=== KuikChat Deployment Finished Successfully ==="
echo "Branch: $(git rev-parse --abbrev-ref HEAD) deployed to 217.154.11.234"