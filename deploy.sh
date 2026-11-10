#!/bin/zsh

set -e

# Configuration
PROJECT="$HOME/projects/ecom"
GCP_USER="nagarjunags2014"
GCP_HOST="34.122.111.166"
GCP_PATH="~/malnadProduct"

echo "======================================"
echo "🚀 Building and Deploying to GCP"
echo "======================================"

cd "$PROJECT/apps/backend"

# Step 1: Create Dockerfile and .dockerignore
echo ""
echo "1️⃣  Creating Dockerfile..."
cat > Dockerfile << 'EOF'
FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build
RUN npm run build
EOF

# Create .dockerignore
cat > .dockerignore << 'EOF'
node_modules
.medusa
.DS_Store
*.log
backend.pid
.git
.turbo
EOF

echo "✅ Dockerfile and .dockerignore created"

# Step 2: Build in Docker
echo ""
echo "2️⃣  Building in Docker (Linux binaries)..."
docker build -t medusa-backend-build .

# Step 3: Extract build output
echo ""
echo "3️⃣  Extracting build artifacts..."
rm -rf .medusa/server node_modules
docker create --name medusa-temp medusa-backend-build
docker cp medusa-temp:/app/.medusa/server .medusa/
docker cp medusa-temp:/app/node_modules ./node_modules
docker rm medusa-temp

echo "✅ Build complete"

# Step 4: Copy files to GCP
echo ""
echo "4️⃣  Copying to GCP..."
rsync -avz --progress \
  --delete \
  --exclude ".DS_Store" \
  --exclude "*.log" \
  --exclude "backend.pid" \
  --exclude "Dockerfile" \
  --exclude "src" \
  "$PROJECT/apps/backend/" \
  "$GCP_USER@$GCP_HOST:$GCP_PATH/apps/backend/"

# Step 5: Copy production env
echo ""
echo "5️⃣  Copying .env.production..."
scp "$PROJECT/apps/backend/.env.production" \
  "$GCP_USER@$GCP_HOST:$GCP_PATH/apps/backend/.env"

# Step 6: Create start script on GCP
echo ""
echo "6️⃣  Creating start.sh on GCP..."
ssh "$GCP_USER@$GCP_HOST" 'cat > ~/malnadProduct/apps/backend/start.sh' << 'STARTSCRIPT'
#!/bin/bash

cd ~/malnadProduct/apps/backend

# Stop existing server
if [ -f backend.pid ]; then
    echo "Stopping existing server..."
    kill $(cat backend.pid) 2>/dev/null || true
    rm backend.pid
fi

# Start server
echo "Starting Medusa backend..."
NODE_ENV=production nohup node .medusa/server/index.js > ~/medusa.log 2>&1 &
echo $! > backend.pid

echo ""
echo "✅ Server started with PID: $(cat backend.pid)"
echo ""
echo "Backend API: http://localhost:9000"
echo "Admin Panel: http://localhost:9000/app"
echo ""
echo "View logs: tail -f ~/medusa.log"
echo "Stop server: kill \$(cat ~/malnadProduct/apps/backend/backend.pid)"
STARTSCRIPT

ssh "$GCP_USER@$GCP_HOST" "chmod +x ~/malnadProduct/apps/backend/start.sh"

# Cleanup
rm -f Dockerfile .dockerignore

echo ""
echo "======================================"
echo "✅ DEPLOYMENT COMPLETE"
echo "======================================"
echo ""
echo "To start the server on GCP, run:"
echo ""
echo "  ssh $GCP_USER@$GCP_HOST"
echo "  bash ~/malnadProduct/apps/backend/start.sh"
echo ""
