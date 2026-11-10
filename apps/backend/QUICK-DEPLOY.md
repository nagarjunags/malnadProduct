# Quick Deployment Guide - TL;DR Version

## 🚀 Fast Track: Get Your Backend Running in 15 Minutes

### On Your Local Machine

**1. Generate Production Secrets**
```bash
# Run these and save the output
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log('COOKIE_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log('AUTH_MFA_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

**2. Prepare Your Code**
```bash
# Ensure .gitignore includes .env
echo ".env" >> .gitignore
echo ".env.production" >> .gitignore
echo "node_modules/" >> .gitignore
echo ".medusa/" >> .gitignore

# Commit and push
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

### On Your GCP VM

**1. Initial Setup (One-time)**
```bash
# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Redis
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Install PM2
sudo npm install -g pm2

# Install Git and PostgreSQL client
sudo apt install git postgresql-client -y
```

**2. Deploy Your Application**
```bash
# Clone your repository
git clone https://github.com/yourusername/your-repo.git
cd your-repo/apps/backend

# Create .env file
nano .env
```

**3. Add Your Environment Variables**
```bash
# Paste this and update with YOUR values:
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
REDIS_URL=redis://localhost:6379

JWT_SECRET=your_generated_jwt_secret
COOKIE_SECRET=your_generated_cookie_secret
AUTH_MFA_ENCRYPTION_KEY=your_generated_encryption_key

STORE_CORS=https://yourdomain.com
ADMIN_CORS=https://admin.yourdomain.com
AUTH_CORS=https://admin.yourdomain.com,https://yourdomain.com

RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_CURRENCY=INR
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

NODE_ENV=production
PORT=9000
MEDUSA_ADMIN_ONBOARDING_TYPE=nextjs
```
Save: `Ctrl+O`, `Enter`, `Ctrl+X`

**4. Run Deployment Script**
```bash
# Make script executable
chmod +x deploy-gcp.sh

# Run deployment
./deploy-gcp.sh
```

**5. Configure Firewall**
```bash
# On GCP VM
sudo ufw allow 9000/tcp
sudo ufw enable

# In GCP Console:
# VPC Network → Firewall → Create Rule
# - Name: allow-medusa
# - Targets: All instances in network
# - Source IP ranges: 0.0.0.0/0
# - Protocols/ports: tcp:9000
```

**6. Create Admin User**
```bash
npx medusa user -e admin@yourdomain.com -p YourSecurePassword123
```

**7. Test**
```bash
# Get your VM's external IP
curl ifconfig.me

# Test locally
curl http://localhost:9000/health

# Test from outside (replace with your VM IP)
curl http://YOUR_VM_IP:9000/health
```

---

## 🎯 That's It! Your Backend is Live

Your API is now accessible at: `http://YOUR_VM_IP:9000`

---

## 📋 Quick Commands

```bash
# View logs
pm2 logs medusa-backend

# Restart
pm2 restart medusa-backend

# Stop
pm2 stop medusa-backend

# Status
pm2 status

# Monitor resources
pm2 monit
```

---

## 🔐 Important Security Notes

1. **Don't skip this**: Set up Nginx + SSL (see DEPLOYMENT.md)
2. Update CORS to only allow your actual domains
3. Use production Razorpay keys (not test keys)
4. Keep your `.env` secure and never commit it

---

## 🔧 Optional but Recommended: Nginx + SSL

**Install Nginx**
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

**Configure**
```bash
sudo nano /etc/nginx/sites-available/medusa
```

Paste:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

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
    }
}
```

**Enable and Get SSL**
```bash
sudo ln -s /etc/nginx/sites-available/medusa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## ❓ Troubleshooting

**Can't connect to database?**
```bash
# Test connection
psql "$DATABASE_URL" -c "SELECT 1"
```

**Redis not working?**
```bash
redis-cli ping  # Should return PONG
sudo systemctl status redis-server
```

**Port already in use?**
```bash
sudo lsof -i :9000
pm2 delete all  # Kill all PM2 processes
```

**Application crashes?**
```bash
pm2 logs medusa-backend --err
```

---

## 📖 Need More Details?

See `DEPLOYMENT.md` for the comprehensive guide.

---

## 🎉 Next Steps

1. Connect your Next.js storefront to `http://YOUR_VM_IP:9000`
2. Set up automated deployments
3. Configure monitoring
4. Set up database backups
5. Add your domain and SSL certificate

---

## 💡 Pro Tips

- Use PM2 Plus for advanced monitoring (free tier available)
- Set up log rotation: `pm2 install pm2-logrotate`
- Monitor costs in GCP Console
- Start small (e2-micro), scale as needed
- Consider Cloud CDN for static assets
- Back up your `.env` file securely offline

---

**Questions?** Check DEPLOYMENT.md or your Medusa documentation.
