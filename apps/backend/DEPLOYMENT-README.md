# Deployment Documentation Overview

This directory contains all the files needed to deploy your Medusa backend to a GCP VM with Neon PostgreSQL.

## 📁 Deployment Files

### 1. **QUICK-DEPLOY.md** ⭐ START HERE
- **TL;DR version** - Get running in 15 minutes
- Step-by-step commands
- Minimal explanation
- Perfect for experienced developers

### 2. **DEPLOYMENT.md**
- **Comprehensive guide** with detailed explanations
- Covers all aspects of deployment
- Includes troubleshooting
- Security best practices
- Monitoring and maintenance

### 3. **DEPLOYMENT-CHECKLIST.md**
- **Complete checklist** for deployment
- Pre-deployment tasks
- Deployment steps
- Post-deployment verification
- Ongoing maintenance schedule

### 4. **deploy-gcp.sh**
- **Automated deployment script**
- Checks system requirements
- Installs dependencies
- Runs migrations
- Starts application with PM2
- Makes deployment faster and less error-prone

### 5. **.env.production.example**
- **Template for production environment variables**
- All required variables documented
- Security notes and best practices
- Copy to `.env` on your GCP VM

### 6. **nginx.conf.example**
- **Nginx reverse proxy configuration**
- HTTPS support
- WebSocket support
- Rate limiting (optional)
- Copy to `/etc/nginx/sites-available/medusa`

### 7. **ecosystem.config.example.js**
- **PM2 process manager configuration**
- Auto-restart on crashes
- Logging configuration
- Resource limits
- Copy to `ecosystem.config.js`

## 🚀 Quick Start Path

Choose your path based on your experience level:

### Path A: Fast Track (Experienced Developers)
1. Read **QUICK-DEPLOY.md**
2. Use **deploy-gcp.sh** script
3. Reference **DEPLOYMENT-CHECKLIST.md** for verification

### Path B: Comprehensive (First-Time Deployers)
1. Read **DEPLOYMENT.md** thoroughly
2. Follow **DEPLOYMENT-CHECKLIST.md** step-by-step
3. Use **deploy-gcp.sh** to automate where possible

### Path C: Fully Manual (Learning/Custom Setup)
1. Read **DEPLOYMENT.md**
2. Manually execute each step
3. Customize configuration files
4. Use checklist for verification

## 📝 What You Need Before Starting

### From Neon PostgreSQL
- [ ] Database connection URL
  - Format: `postgresql://user:pass@host.neon.tech/db?sslmode=require`
  - Get from Neon dashboard

### From Razorpay
- [ ] Production API keys (rzp_live_*)
- [ ] Production secret key
- [ ] Webhook secret
- [ ] Get from Razorpay dashboard

### From Your Setup
- [ ] GCP VM instance running Ubuntu/Debian
- [ ] SSH access to VM
- [ ] Domain name (optional but recommended)
- [ ] Your storefront URL for CORS

## 🔧 System Requirements

### GCP VM Minimum Specs
- **OS**: Ubuntu 20.04+ or Debian 11+
- **CPU**: 2 vCPUs (e2-small or better)
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 20GB minimum
- **Network**: Static external IP recommended

### Software Requirements
- Node.js 20+
- Redis 6+
- PM2 (process manager)
- Git
- PostgreSQL client (psql)
- Nginx (recommended)

## 📊 Deployment Flow

```
Local Machine                    GCP VM                      Neon PostgreSQL
─────────────                    ──────                      ───────────────
                                                            
1. Generate secrets              
2. Push code to Git              
                                ↓
                                3. Clone repository
                                4. Install Node.js, Redis, PM2
                                5. Create .env file
                                                            ↓
                                6. Run migrations ────────→ Initialize DB
                                                            ↓
                                7. Build application        Test connection
                                8. Start with PM2
                                9. Configure Nginx/SSL
                                10. Test endpoints ←────────┘
```

## 🎯 Deployment Checklist Preview

### Pre-Deployment
- [ ] Code tested locally
- [ ] Secrets generated
- [ ] Neon database ready
- [ ] Razorpay production keys ready

### Deployment
- [ ] VM set up and configured
- [ ] Application deployed
- [ ] Database initialized
- [ ] PM2 running

### Post-Deployment
- [ ] HTTPS configured
- [ ] Payment flow tested
- [ ] Monitoring set up
- [ ] Backups configured

See **DEPLOYMENT-CHECKLIST.md** for the complete checklist.

## 🔐 Security Notes

**Critical Security Steps:**

1. **Generate Strong Secrets**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

2. **Never Commit Secrets**
   - Keep `.env` in `.gitignore`
   - Store secrets in a password manager

3. **Use Production Keys**
   - Razorpay: Use `rzp_live_*` not `rzp_test_*`
   - Never use test keys in production

4. **Configure CORS Properly**
   - Only allow your actual domains
   - No wildcards (*) in production

5. **Set Up HTTPS**
   - Use Let's Encrypt (free)
   - Force HTTPS redirect
   - Enable HSTS

## 🆘 Need Help?

### Common Issues and Solutions

**"Can't connect to database"**
→ See DEPLOYMENT.md Section: Troubleshooting → Database connection issues

**"Port already in use"**
→ See DEPLOYMENT.md Section: Troubleshooting → Application won't start

**"Redis not working"**
→ See DEPLOYMENT.md Section: Troubleshooting → Redis connection issues

**"Payment authorization failed"**
→ Check Razorpay keys, webhook configuration, CORS settings

### Resources

- [Medusa Documentation](https://docs.medusajs.com)
- [Neon Documentation](https://neon.tech/docs)
- [PM2 Documentation](https://pm2.keymetrics.io/docs)
- [Nginx Documentation](https://nginx.org/en/docs/)

## 📞 Support Contacts

```
Medusa: https://discord.gg/medusajs
Neon: support@neon.tech
Razorpay: https://razorpay.com/support/
GCP: https://cloud.google.com/support
```

## ✅ Success Indicators

Your deployment is successful when:

✅ `curl http://your-vm-ip:9000/health` returns 200 OK
✅ Admin panel loads via HTTPS
✅ Payment flow completes successfully
✅ No errors in PM2 logs for 24 hours
✅ Database queries are fast
✅ Backups are working
✅ Monitoring is active

## 🎉 After Successful Deployment

1. **Connect Your Storefront**
   - Update storefront API URL
   - Test end-to-end flow

2. **Set Up Monitoring**
   - PM2 Plus (optional)
   - GCP Monitoring
   - Uptime monitoring

3. **Configure Backups**
   - Database backups (Neon automatic)
   - Code backups (Git)
   - Environment variable backups (offline)

4. **Document Everything**
   - Admin credentials
   - API endpoints
   - Emergency procedures

5. **Train Your Team**
   - Share access credentials
   - Review deployment process
   - Set up on-call rotation

## 📈 Next Level (Optional)

- [ ] Set up CI/CD pipeline
- [ ] Configure automated testing
- [ ] Add APM (Application Performance Monitoring)
- [ ] Set up log aggregation
- [ ] Configure CDN for static assets
- [ ] Implement blue-green deployment
- [ ] Add load balancer (for high traffic)

## 🔄 Regular Maintenance

- **Daily**: Check logs and uptime
- **Weekly**: Review metrics and disk space
- **Monthly**: Update dependencies and review security
- **Quarterly**: Audit access and costs

---

**Ready to deploy?**

Start with **QUICK-DEPLOY.md** for the fastest path, or **DEPLOYMENT.md** for comprehensive guidance.

Good luck! 🚀
