#!/bin/bash

# Script to generate secure secrets for production deployment

echo "🔐 Generating Secure Secrets for Medusa Production"
echo "=================================================="
echo ""

echo "Copy these values to your .env file on the GCP VM:"
echo ""

echo "# Generated on: $(date)"
echo ""

echo "# JWT Secret (32+ bytes, base64 encoded):"
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")"
echo ""

echo "# Cookie Secret (32+ bytes, base64 encoded):"
echo "COOKIE_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")"
echo ""

echo "# MFA Encryption Key (64 hex characters):"
echo "AUTH_MFA_ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
echo ""

echo "=================================================="
echo "⚠️  IMPORTANT:"
echo "1. Save these secrets securely (password manager)"
echo "2. Never commit these to Git"
echo "3. Use different secrets for each environment"
echo "=================================================="
