# Medusa Backend Deployment Guide - GCP VM + Neon PostgreSQL

## Prerequisites
- GCP VM instance (Ubuntu 20.04+ or Debian recommended)
- Neon PostgreSQL connection URL
- Domain name (optional, for production)

## Step 1: Prepare Your Local Environment

### Update your `.env` for production
Create a `.env.production` file with your production values:

```bash
# Database - Replace with your Neon PostgreSQL URL
DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require

# CORS - Update with your actual domains
STORE_CORS=https://yourdomain.com,https://www.yourdomain.com
ADMIN_CORS=https://admin.yourdomain.com,https://yourdomain.com
AUTH_CORS=https://admin.yourdomain.com,https://yourdomain.com,https://api.yourdomain.com

# Redis - You'll need Redis on GCP
REDIS_URL=redis://localhost:6379

# Secrets - GENERATE NEW SECURE VALUES!
JWT_SECRET=your-secure-jwt-secret-min-32-chars
COOKIE_SECRET=your-secure-cookie-secret-min-32-chars
AUTH_MFA_ENCRYPTION_KEY=your-64-char-hex-encryption-key

# Razorpay - Use your production keys
RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
RAZORPAY_KEY_SECRET=your_live_secret
RAZORPAY_CURRENCY=INR
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Admin onboarding
MEDUSA_ADMIN_ONBOARDING_TYPE=nextjs

# Node environment
NODE_ENV=production
PORT=9000
```

### Generate secure secrets
```bash
# Generate JWT_SECRET (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate COOKIE_SECRET (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate AUTH_MFA_ENCRYPTION_KEY (64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 2: Set Up GCP VM

### SSH into your GCP VM
```bash
gcloud compute ssh your-instance-name --zone=your-zone
```

### Install Node.js 20+
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v20.x or higher
npm --version
```

### Install Redis
```bash
# Install Redis
sudo apt install redis-server -y

# Configure Redis to start on boot
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Verify Redis is running
redis-cli ping  # Should return "PONG"
```

### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### Install Git
```bash
sudo apt install git -y
```

## Step 3: Deploy Your Application

### Option A: Deploy from Git Repository (Recommended)

1. **Push your code to a Git repository** (GitHub, GitLab, etc.)
   ```bash
   # On your local machine
   cd /Users/nagarjunags/projects/ecom/apps/backend
   git init  # if not already initialized
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Clone on GCP VM**
   ```bash
   # On GCP VM
   cd /home/$USER
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo/apps/backend
   ```

### Option B: Deploy via SCP/RSYNC

```bash
# On your local machine
# Exclude node_modules and build artifacts
rsync -avz --exclude 'node_modules' \
  --exclude '.medusa' \
  --exclude 'dist' \
  --exclude '.git' \
  /Users/nagarjunags/projects/ecom/apps/backend/ \
  your-gcp-username@your-vm-ip:/home/$USER/medusa-backend/
```

### Install Dependencies on GCP VM
```bash
cd /home/$USER/medusa-backend
npm install --production
```

## Step 4: Configure Environment Variables

```bash
# Create .env file on GCP VM
nano .env
```

Paste your production environment variables (from Step 1). Then save (Ctrl+O, Enter, Ctrl+X).

**Important Security Note**: Never commit `.env` to Git! Ensure it's in `.gitignore`.

## Step 5: Initialize Database

```bash
# Run Medusa migrations to set up database schema
npx medusa migrations run

# Verify database connection
npx medusa user -e admin@example.com -p supersecret
# This creates an admin user - update email/password as needed
```

## Step 6: Build the Application

```bash
npm run build
```

## Step 7: Start with PM2

Create a PM2 ecosystem file:

```bash
nano ecosystem.config.js
```

Add this configuration:

```javascript
module.exports = {
  apps: [{
    name: 'medusa-backend',
    script: 'npx',
    args: 'medusa start',
    cwd: '/home/$USER/medusa-backend',
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
```

Start the application:

```bash
# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Follow the command it shows (will be sudo-specific to your user)

# Check status
pm2 status
pm2 logs medusa-backend
```

## Step 8: Configure Firewall

```bash
# Allow port 9000 for Medusa API
sudo ufw allow 9000/tcp

# If using HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

**GCP Firewall Rules**: Also configure in GCP Console:
- Go to VPC Network → Firewall
- Create rule allowing TCP port 9000 from your sources
- Create rules for 80/443 if using reverse proxy

## Step 9: Set Up Nginx Reverse Proxy (Recommended)

### Install Nginx
```bash
sudo apt install nginx -y
```

### Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/medusa
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # Replace with your domain

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeouts for long-running requests
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/medusa /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

### Install SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```

## Step 10: Update CORS Settings

Update your `.env` on the GCP VM with the correct domain:

```bash
STORE_CORS=https://yourdomain.com
ADMIN_CORS=https://admin.yourdomain.com
AUTH_CORS=https://admin.yourdomain.com,https://api.yourdomain.com
```

Restart the application:

```bash
pm2 restart medusa-backend
```

## Useful PM2 Commands

```bash
# View logs
pm2 logs medusa-backend

# Restart application
pm2 restart medusa-backend

# Stop application
pm2 stop medusa-backend

# Delete from PM2
pm2 delete medusa-backend

# Monitor
pm2 monit

# View detailed info
pm2 info medusa-backend
```

## Database Backup (Neon PostgreSQL)

Neon provides automatic backups, but you can also create manual backups:

```bash
# Install PostgreSQL client
sudo apt install postgresql-client -y

# Create backup
pg_dump "postgresql://username:password@host.neon.tech/dbname?sslmode=require" > backup-$(date +%Y%m%d).sql

# Restore from backup
psql "postgresql://username:password@host.neon.tech/dbname?sslmode=require" < backup-20240101.sql
```

## Testing Your Deployment

```bash
# Test API health
curl http://localhost:9000/health

# Test from external
curl http://your-vm-ip:9000/health

# With domain (after Nginx setup)
curl https://api.yourdomain.com/health
```

## Updating Your Application

```bash
# Stop the application
pm2 stop medusa-backend

# Pull latest changes (if using Git)
git pull origin main

# Install dependencies
npm install --production

# Run new migrations (if any)
npx medusa migrations run

# Rebuild
npm run build

# Restart
pm2 restart medusa-backend
```

## Monitoring and Logs

```bash
# View application logs
pm2 logs medusa-backend --lines 100

# View error logs only
pm2 logs medusa-backend --err

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View system resources
pm2 monit
```

## Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs medusa-backend

# Check if port is in use
sudo lsof -i :9000

# Test database connection
node -e "require('pg').Client({ connectionString: process.env.DATABASE_URL }).connect().then(() => console.log('DB OK')).catch(e => console.error('DB Error:', e))"
```

### Database connection issues
- Ensure Neon PostgreSQL allows connections from your GCP VM IP
- Check if `sslmode=require` is in connection string
- Verify credentials are correct

### Redis connection issues
```bash
# Check Redis status
sudo systemctl status redis-server

# Test Redis
redis-cli ping

# Check if Redis is listening
sudo netstat -tulpn | grep redis
```

## Security Checklist

- [ ] Generated strong, unique secrets for JWT and cookies
- [ ] Updated CORS settings to only allow your domains
- [ ] Configured GCP firewall rules
- [ ] Set up SSL/TLS with Let's Encrypt
- [ ] Never committed `.env` to version control
- [ ] Set up regular database backups
- [ ] Configured PM2 to restart on crashes
- [ ] Set up monitoring/alerting (optional: PM2 Plus)
- [ ] Reviewed and secured admin user credentials
- [ ] Used production Razorpay keys (not test keys)

## Cost Optimization

- Start with a small GCP VM (e2-micro or e2-small)
- Use Neon's free tier for development/testing
- Monitor Redis memory usage
- Set up log rotation to prevent disk space issues
- Consider Cloud Storage for uploaded media files

## Next Steps

1. Set up automated deployments (GitHub Actions, Cloud Build)
2. Configure monitoring (PM2 Plus, Google Cloud Monitoring)
3. Set up alerting for downtime
4. Configure automatic SSL renewal
5. Set up database backup automation
6. Configure CDN for static assets
