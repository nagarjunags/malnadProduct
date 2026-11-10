# Deployment Guide - Medusa Backend to GCP

## Overview

This guide explains how to build your Medusa backend locally on your Mac and deploy it to your GCP server.

## Why Build Locally?

- **Low RAM on GCP**: Your GCP VM doesn't have enough RAM to build Medusa
- **Fast Builds**: Building on your Mac is faster than on a small VM
- **Cross-platform**: We build on Mac, copy everything (including node_modules) to Linux GCP

## Files

- **`deploy.sh`** - Run on your Mac to build and deploy
- **`apps/backend/start.sh`** - Created on GCP to start the server

---

## 📋 Prerequisites

### On Your Mac:
- pnpm installed
- SSH access to GCP server
- rsync available (pre-installed on macOS)

### On GCP Server:
- Node.js v22+ installed
- SSH access configured

---

## 🚀 Deployment Steps

### 1. Deploy from your Mac

```bash
cd ~/projects/ecom
./deploy.sh
```

This will:
1. Build Medusa locally using pnpm
2. Copy `.medusa/server/` to GCP
3. Copy `node_modules/` to GCP
4. Copy `.env.production` as `.env` to GCP
5. Create `start.sh` script on GCP

### 2. Start Server on GCP

```bash
ssh nagarjunags2014@34.122.111.166
cd ~/malnadProduct/apps/backend
bash start.sh
```

---

## 📝 Managing the Server on GCP

### View Logs
```bash
tail -f ~/medusa.log
```

### Check if Running
```bash
ps -p $(cat ~/malnadProduct/apps/backend/backend.pid)
# or
lsof -i :9000
```

### Stop Server
```bash
cd ~/malnadProduct/apps/backend
kill $(cat backend.pid)
```

### Restart Server
```bash
cd ~/malnadProduct/apps/backend
bash start.sh
```

---

## 🔧 Configuration

### GCP Server Details
- **IP**: 34.122.111.166
- **User**: nagarjunags2014
- **Path**: ~/malnadProduct
- **Port**: 9000

### Environment
- Production config: `apps/backend/.env.production`
- Copied to GCP as: `~/malnadProduct/apps/backend/.env`

---

## ⚠️ Important Notes

1. **Build First**: Always build locally before deploying
2. **node_modules**: Mac and Linux binaries are different, but rsync handles the full copy
3. **Database**: Make sure `.env.production` has correct DATABASE_URL for GCP deployment
4. **Port 9000**: Ensure port 9000 is open on your GCP firewall
5. **Background Process**: The server runs with `nohup` and survives terminal disconnection

---

## 🐛 Troubleshooting

### Build fails locally
```bash
cd apps/backend
rm -rf .medusa node_modules
pnpm install
pnpm run build
```

### Can't connect to GCP
```bash
ssh nagarjunags2014@34.122.111.166
# If this fails, check your SSH keys and GCP firewall
```

### Server won't start on GCP
```bash
# Check logs
tail -100 ~/medusa.log

# Check if port is already in use
lsof -i :9000

# Check Node.js version
node --version  # Should be v22+
```

### Database connection issues
- Verify DATABASE_URL in ~/malnadProduct/apps/backend/.env
- Check if the Neon database is accessible from GCP IP
- Test connection: `psql $DATABASE_URL`

---

## 🔄 Quick Reference

### Full Redeploy
```bash
# On Mac
cd ~/projects/ecom
./deploy.sh

# On GCP
ssh nagarjunags2014@34.122.111.166
cd ~/malnadProduct/apps/backend
bash start.sh
```

### Update Code Only (no rebuild)
```bash
# On Mac
cd ~/projects/ecom
rsync -avz --progress apps/backend/.medusa/server/ \
  nagarjunags2014@34.122.111.166:~/malnadProduct/apps/backend/.medusa/server/

# On GCP - restart
ssh nagarjunags2014@34.122.111.166
cd ~/malnadProduct/apps/backend
kill $(cat backend.pid)
bash start.sh
```

---

## 🎯 Access Points

After deployment and starting the server:

- **Backend API**: `http://34.122.111.166:9000`
- **Admin Panel**: `http://34.122.111.166:9000/app`
- **Health Check**: `http://34.122.111.166:9000/health`

Make sure your GCP firewall allows incoming connections on port 9000!
