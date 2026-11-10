# Your Medusa Backend Deployment - Step by Step

This guide is customized for your specific setup with Neon PostgreSQL.

## ✅ What You Already Have

- ✅ Neon PostgreSQL database configured
- ✅ Database URL: `ep-morning-forest-a563ks89-pooler.us-east-2.aws.neon.tech`
- ✅ Razorpay test keys configured
- ✅ Backend code ready with fixed payment flow

## 📋 What You Still Need

- [ ] GCP VM instance
- [ ] Production domain (or you can use VM IP initially)
- [ ] Razorpay live keys (when ready to accept real payments)

---

## Part 1: Prepare Locally (5 minutes)

### Step 1: Generate Production Secrets

```bash
cd /Users/nagarjunags/projects/ecom/apps/backend

# Generate secrets and save the output
./generate-secrets.sh
```

**Save the output** in a secure location (password manager, encrypted file, etc.)

### Step 2: Test Local Database Connection (Optional)

```bash
# Test if you can connect to Neon from local machine
npm install -g pg

node -e "
const { Client } = require('pg');
const client = new Client({ 
  connectionString: 'postgresql://neondb_owner:npg_tmRxD9a6dVik@ep-morning-forest-a563ks89-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'
});
client.connect()
  .then(() => {
    console.log('✅ Connected to Neon PostgreSQL successfully!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Server time:', res.rows[0].now);
    return client.end();
  })
  .catch(e => console.error('❌ Connection error:', e.message));
"
```

### Step 3: Push Code to Git

```bash
# Make sure you're in the backend directory
cd /Users/nagarjunags/projects/ecom/apps/backend

# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "Ready for production deployment with Neon PostgreSQL"

# Push to your repository
git push origin main
```

---

## Part 2: Set Up GCP VM (20 minutes)

### Step 1: Create GCP VM Instance

**Option A: Using GCP Console** (Recommended for beginners)

1. Go to: https://console.cloud.google.com/compute/instances
2. Click "CREATE INSTANCE"
3. Configure:
   - **Name**: `medusa-backend-prod`
   - **Region**: `us-east1` (or close to Neon region: us-east-2)
   - **Machine type**: `e2-small` (2 vCPU, 2GB RAM) - minimum
   - **Boot disk**: Ubuntu 22.04 LTS, 20GB
   - **Firewall**: Check "Allow HTTP traffic" and "Allow HTTPS traffic"
4. Click "CREATE"
5. Wait for instance to start

**Option B: Using gcloud CLI**

```bash
gcloud compute instances create medusa-backend-prod \
  --zone=us-east1-b \
  --machine-type=e2-small \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB \
  --tags=http-server,https-server
```

### Step 2: Note Your VM's External IP

```bash
# Get your VM's external IP
gcloud compute instances describe medusa-backend-prod \
  --zone=us-east1-b \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

**Save this IP address** - you'll need it!

### Step 3: Configure Firewall for Port 9000

**In GCP Console:**

1. Go to: VPC Network → Firewall
2. Click "CREATE FIREWALL RULE"
3. Configure:
   - **Name**: `allow-medusa-backend`
   - **Targets**: All instances in the network
   - **Source IP ranges**: `0.0.0.0/0`
   - **Protocols and ports**: `tcp:9000`
4. Click "CREATE"

**OR using gcloud CLI:**

```bash
gcloud compute firewall-rules create allow-medusa-backend \
  --allow=tcp:9000 \
  --source-ranges=0.0.0.0/0 \
  --description="Allow Medusa backend on port 9000"
```

### Step 4: SSH into Your VM

```bash
# SSH into your instance
gcloud compute ssh medusa-backend-prod --zone=us-east1-b
```

You're now on your GCP VM! 🎉

---

## Part 3: Install Dependencies on VM (10 minutes)

Run these commands on your GCP VM:

### Step 1: Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2: Install Node.js 20

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version  # Should show v20.x.x
npm --version
```

### Step 3: Install Redis

```bash
# Install Redis
sudo apt install redis-server -y

# Enable and start Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Test Redis
redis-cli ping  # Should return "PONG"
```

### Step 4: Install PM2

```bash
sudo npm install -g pm2
```

### Step 5: Install Git and PostgreSQL Client

```bash
sudo apt install git postgresql-client -y
```

---

## Part 4: Deploy Application (15 minutes)

### Step 1: Clone Your Repository

```bash
# Go to home directory
cd ~

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Navigate to backend directory
cd YOUR_REPO/apps/backend

# OR if backend is in root:
# cd YOUR_REPO
```

### Step 2: Install Dependencies

```bash
npm install --production
```

### Step 3: Create Production .env File

```bash
nano .env
```

Paste the following (update the secrets with values from your `generate-secrets.sh` output):

```bash
# Database - Already configured for you!
DATABASE_URL=postgresql://neondb_owner:npg_tmRxD9a6dVik@ep-morning-forest-a563ks89-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require

# Redis
REDIS_URL=redis://localhost:6379

# CORS - Update with your actual domains or use VM IP for now
STORE_CORS=http://YOUR_VM_IP:3000,http://localhost:3000
ADMIN_CORS=http://YOUR_VM_IP:9000,http://localhost:9000
AUTH_CORS=http://YOUR_VM_IP:9000,http://YOUR_VM_IP:3000

# Secrets - REPLACE with output from generate-secrets.sh
JWT_SECRET=YOUR_GENERATED_JWT_SECRET
COOKIE_SECRET=YOUR_GENERATED_COOKIE_SECRET
AUTH_MFA_ENCRYPTION_KEY=YOUR_GENERATED_ENCRYPTION_KEY

# Razorpay - Using test keys initially
RAZORPAY_KEY_ID=rzp_test_TRyt8YjKbZkY4E
RAZORPAY_KEY_SECRET=5qPsZp1tgqbabRpzSLhAecch
RAZORPAY_CURRENCY=INR
RAZORPAY_WEBHOOK_SECRET=wh_1a031f790976fe4f7b41c95e22e8be68bb207045f9475e90978224c08ae37878

# Application
NODE_ENV=production
PORT=9000
MEDUSA_ADMIN_ONBOARDING_TYPE=nextjs
```

**Save**: Press `Ctrl+O`, `Enter`, then `Ctrl+X`

### Step 4: Test Database Connection

```bash
# Test connection to Neon
node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(() => console.log('✅ Database connected!'))
  .then(() => client.end())
  .catch(e => console.error('❌ Error:', e.message));
"
```

### Step 5: Run Database Migrations

```bash
# Initialize the database schema
npx medusa migrations run
```

You should see output showing migrations being applied.

### Step 6: Create Admin User

```bash
# Create your first admin user
npx medusa user -e admin@yourdomain.com -p YourSecurePassword123

# Replace with your actual email and a strong password
```

### Step 7: Build Application

```bash
npm run build
```

This will take a few minutes. Wait for it to complete.

### Step 8: Start with PM2

```bash
# Create logs directory
mkdir -p logs

# Use the deployment script
chmod +x deploy-gcp.sh
./deploy-gcp.sh

# OR start manually:
# pm2 start npm --name medusa-backend -- start
# pm2 save
# pm2 startup  # Follow the command it shows
```

### Step 9: Check Status

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs medusa-backend

# If you see "Server is ready", you're good! 🎉
```

---

## Part 5: Test Your Deployment (5 minutes)

### On Your GCP VM:

```bash
# Test health endpoint
curl http://localhost:9000/health

# Should return: {"status":"ok"}
```

### From Your Local Machine:

```bash
# Replace YOUR_VM_IP with your actual VM IP
curl http://YOUR_VM_IP:9000/health

# Test admin endpoint
curl http://YOUR_VM_IP:9000/admin/auth

# Test store endpoint
curl http://YOUR_VM_IP:9000/store/products
```

### In Your Browser:

```
http://YOUR_VM_IP:9000/app

# This should load the Medusa admin panel
# Login with the credentials you created
```

---

## Part 6: Update Your Storefront (2 minutes)

Update your Next.js storefront to point to the production backend:

```bash
# In your storefront .env file:
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://YOUR_VM_IP:9000
```

---

## 🎉 Success! Your Backend is Live!

Your Medusa backend is now running on:
- **API**: `http://YOUR_VM_IP:9000`
- **Admin**: `http://YOUR_VM_IP:9000/app`
- **Health Check**: `http://YOUR_VM_IP:9000/health`

---

## 🔒 Important Next Steps

### 1. Set Up Domain + HTTPS (Highly Recommended)

Once you have a domain:

```bash
# Install Nginx and Certbot
sudo apt install nginx certbot python3-certbot-nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/medusa
```

Use the config from `nginx.conf.example`, then:

```bash
sudo ln -s /etc/nginx/sites-available/medusa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com
```

### 2. Update CORS for Domain

```bash
# On VM, update .env:
nano .env

# Change CORS to use your domain:
STORE_CORS=https://yourdomain.com
ADMIN_CORS=https://admin.yourdomain.com
AUTH_CORS=https://admin.yourdomain.com,https://api.yourdomain.com

# Restart
pm2 restart medusa-backend
```

### 3. Switch to Razorpay Live Keys

When ready for real payments:

```bash
# Update .env with live keys:
RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY
RAZORPAY_KEY_SECRET=your_live_secret

# Restart
pm2 restart medusa-backend
```

---

## 📊 Useful Commands

```bash
# View logs
pm2 logs medusa-backend

# Restart
pm2 restart medusa-backend

# Stop
pm2 stop medusa-backend

# Monitor resources
pm2 monit

# Check disk space
df -h

# Check memory
free -h

# Check Redis
redis-cli ping
```

---

## ❓ Troubleshooting

**"Can't connect to database"**
- Check if DATABASE_URL is correct in .env
- Verify Neon allows connections from your VM IP
- Test: `psql "$DATABASE_URL" -c "SELECT 1"`

**"Port 9000 already in use"**
```bash
sudo lsof -i :9000
pm2 delete all
```

**"Application keeps crashing"**
```bash
pm2 logs medusa-backend --err
# Check for specific errors
```

**"Payment not working"**
- Verify Razorpay keys in .env
- Check CORS settings
- View logs during payment

---

## 📖 More Information

- See `DEPLOYMENT.md` for comprehensive guide
- See `QUICK-DEPLOY.md` for quick reference
- See `DEPLOYMENT-CHECKLIST.md` for complete checklist

---

**Need help?** Check the documentation files or reach out!

🚀 **Congratulations on your deployment!**
