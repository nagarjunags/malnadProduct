#!/bin/bash

# Medusa Backend Deployment Script for GCP VM
# Run this script on your GCP VM after initial server setup

set -e  # Exit on error

echo "🚀 Medusa Backend Deployment Script"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    print_error "This script must be run on Linux (GCP VM)"
    exit 1
fi

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run this script as root"
    exit 1
fi

echo "Step 1: Checking system requirements..."
echo "----------------------------------------"

# Check Node.js version
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo "Install Node.js 20+ with:"
    echo "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "sudo apt-get install -y nodejs"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version must be 20 or higher (current: $(node -v))"
    exit 1
fi
print_success "Node.js $(node -v) is installed"

# Check Redis
if ! command -v redis-cli &> /dev/null; then
    print_warning "Redis is not installed"
    read -p "Install Redis? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo apt update
        sudo apt install -y redis-server
        sudo systemctl enable redis-server
        sudo systemctl start redis-server
        print_success "Redis installed and started"
    else
        print_error "Redis is required. Exiting."
        exit 1
    fi
else
    if redis-cli ping | grep -q "PONG"; then
        print_success "Redis is running"
    else
        print_warning "Redis is installed but not running"
        sudo systemctl start redis-server
        print_success "Redis started"
    fi
fi

# Check PM2
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 is not installed"
    read -p "Install PM2 globally? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo npm install -g pm2
        print_success "PM2 installed"
    else
        print_error "PM2 is required. Exiting."
        exit 1
    fi
else
    print_success "PM2 is installed"
fi

echo ""
echo "Step 2: Checking environment configuration..."
echo "----------------------------------------------"

# Check if .env exists
if [ ! -f .env ]; then
    print_error ".env file not found!"
    echo ""
    echo "Please create a .env file with the following variables:"
    echo "DATABASE_URL=your_neon_postgresql_url"
    echo "REDIS_URL=redis://localhost:6379"
    echo "JWT_SECRET=your_jwt_secret"
    echo "COOKIE_SECRET=your_cookie_secret"
    echo "STORE_CORS=your_store_url"
    echo "ADMIN_CORS=your_admin_url"
    echo "AUTH_CORS=your_auth_urls"
    echo ""
    echo "See .env.template for reference"
    exit 1
fi
print_success ".env file found"

# Check required environment variables
source .env 2>/dev/null || true

REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET" "COOKIE_SECRET" "STORE_CORS" "ADMIN_CORS" "AUTH_CORS")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    print_error "Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    exit 1
fi
print_success "All required environment variables are set"

# Check if DATABASE_URL contains sslmode=require for Neon
if [[ "$DATABASE_URL" == *"neon.tech"* ]] && [[ "$DATABASE_URL" != *"sslmode=require"* ]]; then
    print_warning "Neon PostgreSQL connection should include sslmode=require"
fi

echo ""
echo "Step 3: Installing dependencies..."
echo "-----------------------------------"

if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found, installing dependencies..."
    npm install
    print_success "Dependencies installed"
else
    print_success "node_modules exists, skipping install (run 'npm install' manually if needed)"
fi

echo ""
echo "Step 4: Running database migrations..."
echo "---------------------------------------"

read -p "Run database migrations? This will set up your Neon database schema. (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx medusa migrations run
    print_success "Database migrations completed"
else
    print_warning "Skipped database migrations"
fi

echo ""
echo "Step 5: Building application..."
echo "--------------------------------"

npm run build
print_success "Application built successfully"

echo ""
echo "Step 6: Setting up PM2 ecosystem..."
echo "------------------------------------"

# Create logs directory
mkdir -p logs

# Get current directory
CURRENT_DIR=$(pwd)

# Create PM2 ecosystem file if it doesn't exist
if [ ! -f ecosystem.config.js ]; then
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'medusa-backend',
    script: 'npx',
    args: 'medusa start',
    cwd: '$CURRENT_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 9000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF
    print_success "Created ecosystem.config.js"
else
    print_success "ecosystem.config.js already exists"
fi

echo ""
echo "Step 7: Starting application with PM2..."
echo "-----------------------------------------"

# Stop existing instance if running
pm2 delete medusa-backend 2>/dev/null || true

# Start with PM2
pm2 start ecosystem.config.js
pm2 save

print_success "Application started with PM2"

echo ""
echo "Step 8: Configuring PM2 startup..."
echo "-----------------------------------"

print_warning "Run the following command to enable PM2 startup on boot:"
pm2 startup | grep "sudo"

echo ""
echo "✅ Deployment Complete!"
echo "======================="
echo ""
echo "Your Medusa backend is now running!"
echo ""
echo "📊 Check status:  pm2 status"
echo "📋 View logs:     pm2 logs medusa-backend"
echo "🔄 Restart:       pm2 restart medusa-backend"
echo "🛑 Stop:          pm2 stop medusa-backend"
echo ""
echo "🌐 API should be accessible at:"
echo "   http://localhost:9000"
echo "   http://$(curl -s ifconfig.me):9000"
echo ""
echo "Test with: curl http://localhost:9000/health"
echo ""
echo "⚠️  Next Steps:"
echo "1. Configure GCP firewall to allow port 9000"
echo "2. Set up Nginx reverse proxy (recommended)"
echo "3. Configure SSL with Let's Encrypt"
echo "4. Update CORS settings in .env"
echo "5. Create admin user: npx medusa user -e admin@example.com -p password"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
