#!/bin/bash

echo "🚀 Deploying Storefront to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm i -g vercel
fi

# Navigate to root directory
cd "$(dirname "$0")"

# Login to Vercel (if not already logged in)
echo "🔐 Logging in to Vercel..."
vercel login

# Deploy
echo "🏗️  Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo "📝 Don't forget to:"
echo "   1. Set environment variables in Vercel dashboard"
echo "   2. Update backend CORS with your Vercel URL"
echo "   3. Update NEXT_PUBLIC_BASE_URL env var with your actual Vercel URL"
