# Medusa Backend — Build & Redeploy to GCP

## 1. Setup

- **Local Mac repo:** `/Users/nagarjunags/projects/ecom`
- **GCP VM:** `nagarjunags2014@34.122.111.166`
- **GCP repo:** `~/malnadProduct`
- **Backend:** Medusa `2.18.0`
- **Backend port:** `9000`
- **Production build:** `apps/backend/.medusa/server`
- **Production start directory:** `apps/backend/.medusa/server`
- **Environment:** `NODE_ENV=production`

Architecture:

```text
Mac
└── /Users/nagarjunags/projects/ecom
    └── apps/backend/.medusa/server
             │
             │ scp
             ▼
GCP VM
└── ~/malnadProduct
    └── apps/backend/.medusa/server
             │
             └── Medusa → port 9000
```

---

## 2. SSH into GCP

From the Mac:

```zsh
ssh nagarjunags2014@34.122.111.166
```

Go to the project:

```zsh
cd ~/malnadProduct
```

---

## 3. Stop the Existing Medusa Server

Before deploying a new build:

```zsh
pkill -f "medusa start" || true
```

The `|| true` means deployment continues even if Medusa is not currently running.

Check:

```zsh
curl http://localhost:9000/health
```

If Medusa is stopped, this request should fail.

---

## 4. Build the Backend Locally on Mac

Exit GCP:

```zsh
exit
```

Go to the local repository:

```zsh
cd /Users/nagarjunags/projects/ecom
```

Build:

```zsh
pnpm --filter @dtc/backend build
```

The production build is generated under:

```text
apps/backend/.medusa/server
```

Verify:

```zsh
ls -lah apps/backend/.medusa/server
```

Verify the Admin build:

```zsh
find apps/backend/.medusa/server -name index.html -type f
```

Expected:

```text
apps/backend/.medusa/server/public/admin/index.html
```

This file is required when Medusa runs in production mode.

---

## 5. Copy the Build to GCP

From the Mac:

```zsh
scp -r \
  /Users/nagarjunags/projects/ecom/apps/backend/.medusa/server \
  nagarjunags2014@34.122.111.166:/home/nagarjunags2014/malnadProduct/apps/backend/.medusa/
```

This copies the local production build to GCP.

---

## 6. Verify the Build on GCP

SSH into GCP:

```zsh
ssh nagarjunags2014@34.122.111.166
```

Go to the backend:

```zsh
cd ~/malnadProduct/apps/backend
```

Check the Admin build:

```zsh
find .medusa/server -name index.html -type f
```

Expected:

```text
.medusa/server/public/admin/index.html
```

---

## 7. Start Medusa Manually

The important part discovered during troubleshooting is that production Medusa must be started from:

```text
~/malnadProduct/apps/backend/.medusa/server
```

Run:

```zsh
cd ~/malnadProduct/apps/backend/.medusa/server
```

Then:

```zsh
NODE_ENV=production npm start
```

A successful startup ends with:

```text
Server is ready on port: 9000
```

---

## 8. Test the Server

From another SSH session, run:

```zsh
curl http://localhost:9000/health
```

Expected:

```text
OK
```

---

## 9. Keep Medusa Running After Closing SSH

Running this:

```zsh
NODE_ENV=production npm start
```

keeps the process attached to the SSH terminal.

For a persistent background process, use:

```zsh
cd ~/malnadProduct/apps/backend/.medusa/server

nohup env NODE_ENV=production npm start > ~/medusa.log 2>&1 < /dev/null &
```

Now you can close SSH:

```zsh
exit
```

The Medusa process should continue running.

---

## 10. Verify After Closing SSH

Reconnect:

```zsh
ssh nagarjunags2014@34.122.111.166
```

Check:

```zsh
curl http://localhost:9000/health
```

Expected:

```text
OK
```

Check the process:

```zsh
ps aux | grep "medusa start"
```

Check logs:

```zsh
tail -f ~/medusa.log
```

---

# 11. Complete Manual Redeployment

This is the standard deployment procedure.

### Step 1 — Local Mac

```zsh
cd /Users/nagarjunags/projects/ecom
```

### Step 2 — Push Git changes

```zsh
git push origin main
```

### Step 3 — Build locally

```zsh
pnpm --filter @dtc/backend build
```

### Step 4 — Copy build to GCP

```zsh
scp -r \
  apps/backend/.medusa/server \
  nagarjunags2014@34.122.111.166:/home/nagarjunags2014/malnadProduct/apps/backend/.medusa/
```

### Step 5 — SSH into GCP

```zsh
ssh nagarjunags2014@34.122.111.166
```

### Step 6 — Stop old server

```zsh
pkill -f "medusa start" || true
```

### Step 7 — Enter production build directory

```zsh
cd ~/malnadProduct/apps/backend/.medusa/server
```

### Step 8 — Start in background

```zsh
nohup env NODE_ENV=production npm start > ~/medusa.log 2>&1 < /dev/null &
```

### Step 9 — Wait

```zsh
sleep 5
```

### Step 10 — Health check

```zsh
curl http://localhost:9000/health
```

Expected:

```text
OK
```

### Step 11 — Exit SSH

```zsh
exit
```

---

# 12. Quick Redeployment Commands

Once everything is familiar, the process can be summarized as:

### Mac

```zsh
cd /Users/nagarjunags/projects/ecom

git push origin main

pnpm --filter @dtc/backend build

scp -r \
  apps/backend/.medusa/server \
  nagarjunags2014@34.122.111.166:/home/nagarjunags2014/malnadProduct/apps/backend/.medusa/
```

### GCP

```zsh
ssh nagarjunags2014@34.122.111.166
```

Then:

```zsh
pkill -f "medusa start" || true

cd ~/malnadProduct/apps/backend/.medusa/server

nohup env NODE_ENV=production npm start > ~/medusa.log 2>&1 < /dev/null &

sleep 5

curl http://localhost:9000/health
```

Expected:

```text
OK
```

---

# 13. Important Troubleshooting Notes

## Admin `index.html` error

If you see:

```text
Could not find index.html in the admin build directory.
Make sure to run 'medusa build' before starting the server.
```

Check:

```zsh
find ~/malnadProduct/apps/backend/.medusa -name index.html -type f
```

The production build should contain:

```text
~/malnadProduct/apps/backend/.medusa/server/public/admin/index.html
```

Also make sure you start from:

```zsh
cd ~/malnadProduct/apps/backend/.medusa/server
NODE_ENV=production npm start
```

---

## Redis warning

You may see:

```text
redisUrl not found. A fake redis instance will be used.
```

This is currently expected in this setup because Redis is not configured through `redisUrl`.

Medusa also reports:

```text
Local Event Bus installed. This is not recommended for production.
```

and:

```text
Locking module: Using "in-memory" as default.
```

These are production warnings rather than the Admin build startup error.

---

## pnpm warning

You may see:

```text
The "pnpm" field in package.json is no longer read by pnpm.
```

This is separate from the Medusa Admin build issue.

---

## GCP server not running

The redeployment process still works if Medusa is already stopped.

This command:

```zsh
pkill -f "medusa start" || true
```

does not fail the deployment when there is no Medusa process.

---

# 14. Useful GCP Commands

### Check health

```zsh
curl http://localhost:9000/health
```

### Check process

```zsh
ps aux | grep "medusa start"
```

### View recent logs

```zsh
tail -50 ~/medusa.log
```

### Follow logs live

```zsh
tail -f ~/medusa.log
```

### Stop Medusa

```zsh
pkill -f "medusa start" || true
```

### Start Medusa

```zsh
cd ~/malnadProduct/apps/backend/.medusa/server

nohup env NODE_ENV=production npm start > ~/medusa.log 2>&1 < /dev/null &
```

---

# 15. Final Deployment Flow

```text
┌──────────────────────────┐
│          MAC             │
│                          │
│ git push origin main     │
│          ↓               │
│ pnpm backend build       │
│          ↓               │
│ .medusa/server generated │
└────────────┬─────────────┘
             │
             │ scp
             ▼
┌──────────────────────────┐
│          GCP             │
│                          │
│ Stop old Medusa          │
│          ↓               │
│ Copy new build           │
│          ↓               │
│ cd .medusa/server        │
│          ↓               │
│ NODE_ENV=production      │
│ npm start                │
│          ↓               │
│ nohup/background process │
│          ↓               │
│ Port 9000                │
│          ↓               │
│ /health → OK             │
└──────────────────────────┘
```

## Golden Rule

For this setup, remember:

```zsh
cd ~/malnadProduct/apps/backend/.medusa/server
```

then start production with:

```zsh
nohup env NODE_ENV=production npm start > ~/medusa.log 2>&1 < /dev/null &
```

This is the working production startup method established during troubleshooting.
