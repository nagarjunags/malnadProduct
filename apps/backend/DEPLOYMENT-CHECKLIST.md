# Deployment Checklist

Use this checklist to ensure you've completed all necessary steps for a production deployment.

## Pre-Deployment (Local Machine)

### Code Preparation
- [ ] All code tested locally
- [ ] Razorpay payment flow working correctly
- [ ] No hardcoded secrets in code
- [ ] `.env` added to `.gitignore`
- [ ] `.medusa/` added to `.gitignore`
- [ ] `node_modules/` added to `.gitignore`
- [ ] Code committed to Git repository
- [ ] Code pushed to remote repository (GitHub/GitLab)

### Environment Configuration
- [ ] Generated secure JWT_SECRET (32+ characters)
- [ ] Generated secure COOKIE_SECRET (32+ characters)
- [ ] Generated secure AUTH_MFA_ENCRYPTION_KEY (64 hex characters)
- [ ] Obtained Neon PostgreSQL connection URL
- [ ] Verified Neon URL includes `?sslmode=require`
- [ ] Production Razorpay keys obtained (rzp_live_*)
- [ ] Razorpay webhook secret configured
- [ ] Production domain names identified
- [ ] CORS URLs documented

### Documentation
- [ ] Reviewed DEPLOYMENT.md
- [ ] Reviewed QUICK-DEPLOY.md
- [ ] Saved all secrets securely (password manager/vault)

---

## GCP VM Setup

### Infrastructure
- [ ] GCP VM instance created
- [ ] VM has adequate resources (minimum: e2-small, 2GB RAM)
- [ ] Static external IP assigned (recommended)
- [ ] SSH access configured
- [ ] Domain DNS A record pointing to VM IP (if using domain)

### System Setup
- [ ] Ubuntu/Debian installed and updated
- [ ] Node.js 20+ installed and verified
- [ ] npm installed and verified
- [ ] Redis installed and running
- [ ] Redis configured to start on boot
- [ ] PM2 installed globally
- [ ] Git installed
- [ ] PostgreSQL client installed

### Firewall Configuration
- [ ] VM firewall allows SSH (port 22)
- [ ] VM firewall allows HTTP (port 80) - if using Nginx
- [ ] VM firewall allows HTTPS (port 443) - if using Nginx
- [ ] VM firewall allows application port (9000)
- [ ] GCP firewall rules configured
- [ ] UFW enabled and configured

---

## Application Deployment

### Code Deployment
- [ ] Repository cloned to VM
- [ ] Correct branch checked out
- [ ] Dependencies installed (`npm install --production`)
- [ ] `.env` file created on VM
- [ ] All environment variables set correctly
- [ ] Environment variables verified

### Database Setup
- [ ] Database connection tested
- [ ] Neon PostgreSQL accessible from VM IP
- [ ] Database migrations run successfully
- [ ] Admin user created
- [ ] Admin credentials saved securely

### Application Build & Start
- [ ] Application built successfully (`npm run build`)
- [ ] No build errors
- [ ] PM2 ecosystem file created
- [ ] Application started with PM2
- [ ] PM2 configured for auto-restart
- [ ] PM2 startup configured
- [ ] Application accessible on localhost:9000
- [ ] Health check responds: `curl http://localhost:9000/health`

---

## Reverse Proxy & SSL (Recommended)

### Nginx Setup
- [ ] Nginx installed
- [ ] Nginx configuration created
- [ ] Configuration tested (`sudo nginx -t`)
- [ ] Nginx restarted successfully
- [ ] Application accessible through Nginx

### SSL Certificate
- [ ] Certbot installed
- [ ] SSL certificate obtained
- [ ] SSL certificate auto-renewal configured
- [ ] HTTPS working correctly
- [ ] HTTP redirects to HTTPS
- [ ] SSL Labs test passed (A or A+)

---

## Security Configuration

### Secrets & Environment
- [ ] JWT_SECRET is strong and unique
- [ ] COOKIE_SECRET is strong and unique
- [ ] No test/development secrets used
- [ ] `.env` file not committed to Git
- [ ] File permissions on `.env` set correctly (600)

### CORS Configuration
- [ ] STORE_CORS only includes actual store domain
- [ ] ADMIN_CORS only includes actual admin domain
- [ ] AUTH_CORS properly configured
- [ ] No wildcard (*) CORS in production

### Razorpay Configuration
- [ ] Using production Razorpay keys (rzp_live_*)
- [ ] Not using test keys (rzp_test_*)
- [ ] Webhook secret configured
- [ ] Webhook endpoint secured
- [ ] Payment flow tested end-to-end

### Application Security
- [ ] Admin panel access restricted
- [ ] Strong admin passwords used
- [ ] Rate limiting configured (optional)
- [ ] Security headers configured (optional)

---

## Monitoring & Maintenance

### Logging
- [ ] PM2 logs accessible
- [ ] Log rotation configured
- [ ] Error logs monitored
- [ ] Nginx logs accessible (if applicable)

### Monitoring
- [ ] PM2 monitoring set up
- [ ] Server resource monitoring configured
- [ ] Database performance monitored
- [ ] Uptime monitoring configured (optional)

### Backups
- [ ] Database backup strategy defined
- [ ] Automated backups configured
- [ ] Backup restoration tested
- [ ] `.env` file backed up securely offline

### Updates & Maintenance
- [ ] Update procedure documented
- [ ] Deployment rollback plan created
- [ ] Zero-downtime deployment considered

---

## Testing

### Functionality Tests
- [ ] Health endpoint responds: `/health`
- [ ] Admin panel accessible
- [ ] Admin login works
- [ ] Store API endpoints respond
- [ ] CORS working for storefront
- [ ] Payment flow works end-to-end
- [ ] Razorpay payment completes successfully
- [ ] Order creation works
- [ ] Email notifications work (if configured)

### Performance Tests
- [ ] API response times acceptable
- [ ] Database queries optimized
- [ ] Redis caching working
- [ ] No memory leaks detected
- [ ] PM2 restart working on crashes

### Security Tests
- [ ] HTTPS enforced
- [ ] No secrets exposed in responses
- [ ] Rate limiting working (if configured)
- [ ] SQL injection tested
- [ ] XSS prevention working
- [ ] CSRF protection working

---

## Documentation & Handoff

### Internal Documentation
- [ ] Deployment procedure documented
- [ ] Environment variables documented
- [ ] Admin credentials stored securely
- [ ] Database access documented
- [ ] Emergency contacts listed
- [ ] Rollback procedure documented

### External Documentation
- [ ] API documentation updated
- [ ] Admin user guide created
- [ ] Troubleshooting guide created
- [ ] Support contact information provided

---

## Post-Deployment

### Monitoring (First 24 Hours)
- [ ] Monitor PM2 logs for errors
- [ ] Monitor server resources
- [ ] Monitor database connections
- [ ] Monitor API response times
- [ ] Test payment flow multiple times

### Optimization
- [ ] Review and optimize slow queries
- [ ] Configure CDN (if needed)
- [ ] Set up caching strategy
- [ ] Review and tune PM2 settings

### Communication
- [ ] Stakeholders notified of deployment
- [ ] Support team briefed
- [ ] Customers notified (if needed)
- [ ] Social media updated (if applicable)

---

## Ongoing Maintenance Schedule

### Daily
- [ ] Check PM2 status
- [ ] Review error logs
- [ ] Monitor uptime

### Weekly
- [ ] Review application logs
- [ ] Check disk space
- [ ] Review database size
- [ ] Check SSL certificate expiry

### Monthly
- [ ] Update dependencies
- [ ] Review security patches
- [ ] Test backup restoration
- [ ] Review performance metrics
- [ ] Rotate secrets (optional)

### Quarterly
- [ ] Review and update documentation
- [ ] Audit user permissions
- [ ] Review and optimize costs
- [ ] Conduct security audit
- [ ] Update disaster recovery plan

---

## Emergency Contacts

```
Hosting: GCP Support - [Your GCP Support Plan]
Database: Neon Support - support@neon.tech
Payment: Razorpay Support - [Your Razorpay Account]
DNS: [Your DNS Provider]
SSL: Let's Encrypt - https://community.letsencrypt.org/
Dev Team: [Your Team Contacts]
```

---

## Quick Command Reference

```bash
# Check application status
pm2 status

# View logs
pm2 logs medusa-backend

# Restart application
pm2 restart medusa-backend

# Check disk space
df -h

# Check memory usage
free -h

# Check Redis
redis-cli ping

# Test database connection
psql "$DATABASE_URL" -c "SELECT 1"

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# Check SSL expiry
echo | openssl s_client -servername api.yourdomain.com -connect api.yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## Success Criteria

Your deployment is successful when:

✅ Application is accessible via HTTPS
✅ Health check returns 200 OK
✅ Admin panel loads and login works
✅ Payment flow completes successfully
✅ No errors in logs for 24 hours
✅ All tests pass
✅ Performance meets expectations
✅ Backups are working
✅ Monitoring is active
✅ Team has access and documentation

---

**Congratulations on your deployment! 🎉**

Remember to review this checklist for future deployments and updates.
