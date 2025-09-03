# 🚀 Vercel Deployment Checklist (Hobby Plan Compatible)

## 📋 Pre-Deployment Checklist

### ✅ Repository Setup
- [ ] Repository is public or Vercel has access
- [ ] Frontend code is in the `frontend/` directory
- [ ] All dependencies are properly listed in `package.json`
- [ ] Build scripts are configured correctly
- [ ] Environment variables are documented

### ✅ Code Quality
- [ ] All tests pass locally (`npm test`)
- [ ] TypeScript compilation succeeds (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] No console errors in browser

### ✅ Dependencies
- [ ] Node.js version is 18+ (specified in `engines`)
- [ ] All production dependencies are in `dependencies` (not `devDependencies`)
- [ ] No peer dependency conflicts
- [ ] Package-lock.json is committed

### ✅ Hobby Plan Compatibility
- [ ] No multi-region configuration in `vercel.json`
- [ ] Function usage optimized for 100GB-hours/month limit
- [ ] Bandwidth usage optimized for 100GB/month limit
- [ ] Build time optimized for 6,000 minutes/month limit

## 🚀 Deployment Steps

### 1. Vercel Account Setup
- [ ] Create Vercel account at [vercel.com](https://vercel.com)
- [ ] Verify you're on Hobby (Free) plan
- [ ] Connect GitHub account
- [ ] Install Vercel CLI: `npm i -g vercel`

### 2. Project Creation
- [ ] Go to Vercel Dashboard
- [ ] Click "New Project"
- [ ] Import your GitHub repository
- [ ] Set project name: `stitchos-rfid-frontend`
- [ ] Set framework preset: `Next.js`
- [ ] Set root directory: `frontend`
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `.next`
- [ ] Set install command: `npm ci`

### 3. Environment Variables
Set these in Vercel Dashboard → Project Settings → Environment Variables:

#### Production Environment
```bash
NEXT_PUBLIC_APP_NAME=StitchOS RFID
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com
NEXT_PUBLIC_WS_URL=wss://your-backend-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_ENABLE_PWA=true
```

#### Preview Environment (Optional)
```bash
NEXT_PUBLIC_APP_NAME=StitchOS RFID (Preview)
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENV=preview
NEXT_PUBLIC_API_BASE_URL=https://staging-backend-domain.com
NEXT_PUBLIC_WS_URL=wss://staging-backend-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging_supabase_anon_key
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_PWA=false
```

### 4. Build Configuration
- [ ] Verify build command: `npm run build`
- [ ] Verify output directory: `.next`
- [ ] Verify install command: `npm ci`
- [ ] Set Node.js version to 18.x
- [ ] Verify no multi-region configuration

### 5. Domain Configuration (Hobby Plan: 1 domain limit)
- [ ] Set custom domain: `rfid.stitchos.com` (only 1 domain allowed)
- [ ] Configure DNS records
- [ ] Verify SSL certificate is provisioned
- [ ] Note: Additional domains require Pro plan upgrade

## 🔧 Post-Deployment Verification

### ✅ Functionality Tests
- [ ] Homepage loads correctly
- [ ] Navigation works between tabs
- [ ] Real-time data updates work
- [ ] Authentication flow works
- [ ] API calls succeed
- [ ] WebSocket connections work

### ✅ Performance Tests
- [ ] Page load time < 3 seconds
- [ ] Core Web Vitals are good
- [ ] Images load properly
- [ ] No console errors
- [ ] Mobile responsiveness works

### ✅ Security Tests
- [ ] HTTPS is enforced
- [ ] Security headers are present
- [ ] No sensitive data in client code
- [ ] CORS is configured correctly
- [ ] API endpoints are protected

### ✅ Hobby Plan Limits Check
- [ ] Function usage within 100GB-hours/month
- [ ] Bandwidth usage within 100GB/month
- [ ] Build time within 6,000 minutes/month
- [ ] Custom domains limited to 1

## 📊 Monitoring Setup

### ✅ Vercel Analytics (Hobby Plan)
- [ ] Enable Vercel Analytics
- [ ] Configure basic performance monitoring
- [ ] Set up error tracking
- [ ] Monitor Core Web Vitals
- [ ] Note: Advanced analytics require Pro plan

### ✅ External Monitoring (Optional)
- [ ] Set up Sentry for error tracking
- [ ] Configure Google Analytics
- [ ] Set up uptime monitoring
- [ ] Configure performance alerts

## 🔄 CI/CD Setup

### ✅ GitHub Actions
- [ ] Set repository secrets:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
  - `LHCI_GITHUB_APP_TOKEN`
- [ ] Verify workflow file: `.github/workflows/deploy-vercel.yml`
- [ ] Test automatic deployment on push to main

### ✅ GitLab CI (Alternative)
- [ ] Set GitLab CI/CD variables
- [ ] Verify `.gitlab-ci.yml` configuration
- [ ] Test deployment pipeline

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs in Vercel dashboard
# Verify Node.js version compatibility
# Check for missing dependencies
# Verify build command syntax
```

#### Environment Variable Issues
```bash
# Verify variables are set in correct environment
# Check for typos in variable names
# Ensure NEXT_PUBLIC_ prefix for client-side variables
# Verify variable values are correct
```

#### Performance Issues
```bash
# Run Lighthouse audit
# Check bundle size with npm run analyze
# Verify image optimization
# Check for unnecessary re-renders
```

#### Hobby Plan Limit Issues
```bash
# Check function usage in Vercel dashboard
# Monitor bandwidth consumption
# Optimize build times
# Consider Pro plan upgrade if needed
```

### Emergency Procedures

#### 1. Service Recovery
```bash
# Restart all services
make restart

# Restart specific service
make restart-backend

# Rollback to previous version
make rollback
```

#### 2. Data Recovery
```bash
# Restore from backup
make restore

# Emergency database reset
make db-emergency-reset

# Data export
make export-data
```

## 💡 Hobby Plan Optimization Tips

### Resource Management
1. **Optimize Build Time**
   - Use `npm ci` instead of `npm install`
   - Minimize dependencies
   - Use Next.js built-in optimizations

2. **Reduce Function Usage**
   - Use static generation where possible
   - Minimize API routes
   - Cache expensive operations

3. **Bandwidth Optimization**
   - Compress images and assets
   - Use CDN for static files
   - Implement proper caching

### Scaling Considerations
- **Hobby Plan Limits**: 100GB-hours/month functions, 100GB/month bandwidth
- **Monitor Usage**: Check Vercel dashboard regularly
- **Upgrade Path**: Pro plan for higher limits

## 📚 Additional Resources

### Documentation
- [API Documentation](http://localhost:8002/docs)
- [System Architecture](ARCHITECTURE.md)
- [API Reference](API_REFERENCE.md)
- [User Manual](USER_MANUAL.md)

### Support
- **Technical Issues**: Create issue on GitHub
- **Emergency**: Contact system administrator
- **Documentation**: Check project wiki
- **Training**: Schedule with development team

### Maintenance Schedule
- **Daily**: Health checks, log review
- **Weekly**: Performance monitoring, backup verification
- **Monthly**: Security updates, dependency updates
- **Quarterly**: Full system audit, performance optimization

---

## 🎯 Quick Start Commands

```bash
# Complete setup
make setup

# Start development environment
make dev

# Deploy to staging
make deploy-staging

# Deploy to production
make deploy-production

# Monitor system
make monitor

# Get help
make help
```

For detailed information about each command, run `make help` or check the [Makefile](Makefile).

## 💰 Plan Upgrade Considerations

### When to Consider Pro Plan ($20/month)
- **Function usage exceeds 100GB-hours/month**
- **Bandwidth exceeds 100GB/month**
- **Need multiple custom domains**
- **Require advanced analytics**
- **Need multi-region deployment**

### Hobby Plan Benefits
- **Free forever**
- **Unlimited deployments**
- **Global CDN included**
- **SSL certificates included**
- **Perfect for small to medium projects**

---

## 🎉 Deployment Complete!

Once all items are checked, your StitchOS RFID Dashboard will be:

- ✅ **Live and accessible** at your Vercel URL
- ✅ **Fully functional** with all features working
- ✅ **Performance optimized** with good Core Web Vitals
- ✅ **Secure** with proper headers and HTTPS
- ✅ **Monitored** with basic Vercel Analytics
- ✅ **Automatically deployed** on code changes
- ✅ **Hobby plan compatible** with no multi-region restrictions

**Your RFID system is now production-ready on Vercel Hobby plan!** 🚀

### 💰 Cost-Effective Benefits

- **Free hosting** with Vercel Hobby plan
- **Auto-scaling** for traffic spikes
- **Global CDN** for fast worldwide access
- **Easy upgrade path** to Pro plan when needed