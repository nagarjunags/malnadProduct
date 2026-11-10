# Vercel Deployment Guide for Storefront

## Prerequisites
- ✅ Backend is already hosted elsewhere (you mentioned this is done)
- ✅ You have the backend URL
- ✅ Code is pushed to GitHub/GitLab/Bitbucket

## Quick Deploy Steps

### 1. Push your changes to Git
```bash
git add .
git commit -m "Add Vercel deployment config"
git push origin main
```

### 2. Deploy via Vercel Dashboard

1. Go to https://vercel.com and sign in
2. Click "Add New..." → "Project"
3. Import your `ecom` repository

**Build Settings:**
```
Framework Preset: Next.js
Root Directory: .
Build Command: pnpm turbo build --filter=@dtc/storefront
Output Directory: apps/storefront/.next
Install Command: pnpm install --frozen-lockfile
```

**Environment Variables (IMPORTANT!):**
```
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_5537bb04c91749493005aebe34332b4f922a4fb4d0384e4352ebc6a63a413fba
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://your-backend-url.com
NEXT_PUBLIC_DEFAULT_REGION=in
NEXT_PUBLIC_BASE_URL=https://your-vercel-url.vercel.app
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_TRyt8YjKbZkY4E
NODE_ENV=production
```

4. Click "Deploy"

### 3. Update Backend CORS

After deployment, add your Vercel URL to your backend's allowed origins:

**In your backend .env file:**
```bash
STORE_CORS=https://your-vercel-url.vercel.app,http://localhost:8000
ADMIN_CORS=https://your-vercel-url.vercel.app,http://localhost:9000
AUTH_CORS=https://your-vercel-url.vercel.app,http://localhost:8000
```

### 4. Update Vercel Environment Variable

After first deployment, go back to Vercel:
- Project Settings → Environment Variables
- Update `NEXT_PUBLIC_BASE_URL` with your actual Vercel URL
- Redeploy (Deployments → Click the three dots → Redeploy)

## Alternative: Deploy via CLI

```bash
# From project root
./deploy-storefront.sh
```

Or manually:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Troubleshooting

### Build fails with "next: command not found"
- Vercel might not be finding Next.js in the workspace
- Make sure `vercel.json` has correct paths

### Environment variables not working
- Remember: `NEXT_PUBLIC_*` vars are embedded at BUILD time
- After changing env vars, you MUST redeploy

### Can't connect to backend
- Check `NEXT_PUBLIC_MEDUSA_BACKEND_URL` is correct (no trailing slash)
- Verify backend CORS includes your Vercel URL
- Check backend is publicly accessible

### Images not loading
- Check `next.config.js` image domains
- Ensure S3/CDN URLs are accessible

## Continuous Deployment

Once set up:
- ✅ Every push to `main` → automatic production deployment
- ✅ Every PR → preview deployment with unique URL
- ✅ Instant rollbacks if needed

## Custom Domain (Optional)

1. Go to Vercel → Your Project → Settings → Domains
2. Add your domain (e.g., `shop.yourdomain.com`)
3. Configure DNS records as shown
4. Update `NEXT_PUBLIC_BASE_URL` to your custom domain

## Monitoring

- View logs: Vercel Dashboard → Your Project → Logs
- Analytics: Vercel Dashboard → Your Project → Analytics
- Performance: Vercel Dashboard → Your Project → Speed Insights
