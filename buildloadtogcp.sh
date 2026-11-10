#!/bin/bash

set -e

LOCAL="/Users/nagarjunags/projects/ecom"
GCP="nagarjunags2014@34.122.111.166"
REMOTE="~/malnadProduct"

cd "$LOCAL"

echo "======================================"
echo "Building Medusa backend locally..."
echo "======================================"

pnpm --filter @dtc/backend build

echo ""
echo "✅ Local backend build successful"
echo ""

if [ ! -d "apps/backend/.medusa/server" ]; then
    echo "❌ ERROR: apps/backend/.medusa/server not found"
    exit 1
fi

echo "======================================"
echo "Copying project to GCP..."
echo "======================================"

rsync -avz --progress \
  --exclude "node_modules" \
  --exclude ".git" \
  --exclude ".env" \
  --exclude ".env.production" \
  "$LOCAL/" \
  "$GCP:$REMOTE/"

echo ""
echo "======================================"
echo "✅ Deployment files copied!"
echo "======================================"
echo ""
echo "SSH into GCP:"
echo "ssh $GCP"
echo ""
