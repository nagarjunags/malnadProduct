#!/bin/zsh

set -e

# Configuration
PROJECT="$HOME/projects/ecom"
GCP_USER="nagarjunags2014"
GCP_HOST="34.122.111.166"
GCP_PATH="~/malnadProduct"

echo "======================================"
echo "🚀 Building for Linux and Deploying to GCP"
echo "======================================"

cd "$PROJECT/apps/backend"

# Step 1: Build using Docker (creates Linux-compatible binaries)
echo ""
echo "1️⃣  Building Medusa in Docker (Linux-compatible)..."
docker build -f Dockerfile.build -t medusa-backend-build .

# Step 2: Extract build output from Docker
echo ""
echo "2️⃣  Extracting build artifacts..."
rm -rf .medusa/server
docker create --name medusa-temp medusa-backend-build
docker cp medusa-temp:/app/.medusa/server .medusa/
docker cp medusa-temp:/app/node_modules ./node_modules
docker rm medusa-temp

echo "✅ Build complete"

# Step 3: Copy everything to GCP
echo ""
echo "3️⃣  Copying files to GCP..."
rsync -avz --progress \
  --delete \
  --exclude ".DS_Store" \
  --exclude "*.log" \
  --exclude "backend.pid" \
  --exclude "Dockerfile.build" \
  "$PROJECT/apps/backend/" \
  "$GCP_USER@$GCP_HOST:$GCP_PATH/apps/backend/"

# Step 4: Copy production env
echo ""
echo "4️⃣  Setting up production environment..."
scp "$PROJECT/apps/backend/.env.production" \
  "$GCP_USER@$GCP_HOST:$GCP_PATH/apps/backend/.env"

echo ""
echo "======================================"
echo "✅ DEPLOYMENT COMPLETE"
echo "======================================"
echo ""
echo "To start the server on GCP:"
echo "  ssh $GCP_USER@$GCP_HOST"
echo "  cd $GCP_PATH/apps/backend"
echo "  nohup sh -c 'NODE_ENV=production npm start' > ~/medusa.log 2>&1 &"
echo ""
echo "Check logs:"
echo "  tail -f ~/medusa.log"
echo ""

<img alt="Thumbnail" draggable="false" loading="lazy" decoding="async" data-nimg="fill" class="absolute inset-0 object-cover object-center" src="https://pub-ac6cef098d1148b38f8ddaa59010cdeb.r2.dev/test%20tea-01M1C3SFVDD97T7CVG18ABDS82.jpg" style="position: absolute; height: 100%; width: 100%; inset: 0px;">

https://pub-ac6cef098d1148b38f8ddaa59010cdeb.r2.dev/mphal/test%20tea-01M1C3SFVDD97T7CVG18ABDS82.jpg

<img alt="Product image 1" decoding="async" data-nimg="fill" class="absolute inset-0 rounded-rounded" src="https://pub-ac6cef098d1148b38f8ddaa59010cdeb.r2.dev/test%20tea-01M1C3SFVDD97T7CVG18ABDS82.jpg" style="position: absolute; height: 100%; width: 100%; inset: 0px; object-fit: cover;">

https://pub-ac6cef098d1148b38f8ddaa59010cdeb.r2.dev/test%20tea-01M1C3SFVDD97T7CVG18ABDS82.jpg
https://pub-ac6cef098d1148b38f8ddaa59010cdeb.r2.dev/mphal/test%20tea-01M1C3SFVDD97T7CVG18ABDS82.jpg
https://pub-ac6cef098d1148b38f8ddaa59010cdeb.r2.dev/test%20tea-01M1C3SFVDD97T7CVG18ABDS82.jpg
https://pub-ac6cef098d1148b38f8ddaa59010cdeb.r2.dev/test%20tea-01M1C3SFVDD97T7CVG18ABDS82.jpg

<img src="https://pub-ac6cef098d1148b38f8ddaa59010cdeb.r2.dev/test%20tea-01M1C3SFVDD97T7CVG18ABDS82.jpg" alt="cloudflare test image" class="size-full object-cover">
<img alt="Thumbnail" draggable="false" loading="lazy" decoding="async" data-nimg="fill" class="absolute inset-0 object-cover object-center" src="https://pub-ac6cef098d1148b38f8ddaa59010cdeb.r2.dev/test%20tea-01M1C3SFVDD97T7CVG18ABDS82.jpg" style="position: absolute; height: 100%; width: 100%; inset: 0px;">