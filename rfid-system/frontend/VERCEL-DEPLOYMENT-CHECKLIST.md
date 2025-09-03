# 🚀 Vercel Deployment Checklist

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

## 🚀 Deployment Steps

### 1. Vercel Account Setup
- [ ] Create Vercel account at [vercel.com](https://vercel.com)
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

### 5. Domain Configuration
- [ ] Set custom domain (optional): `rfid.stitchos.com`
- [ ] Configure DNS records
- [ ] Verify SSL certificate is provisioned

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

## 📊 Monitoring Setup

### ✅ Vercel Analytics
- [ ] Enable Vercel Analytics
- [ ] Configure performance monitoring
- [ ] Set up error tracking
- [ ] Monitor Core Web Vitals

### ✅ External Monitoring
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

## 📚 Useful Commands

### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Vercel CLI
```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# List deployments
vercel ls

# View logs
vercel logs

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
```

### Performance Testing
```bash
# Run Lighthouse CI
npm run lighthouse

# Analyze bundle
npm run analyze

# Run performance tests
npm run perf-test
```

## 🎯 Success Criteria

### ✅ Deployment Success
- [ ] Application deploys without errors
- [ ] All environment variables are loaded
- [ ] Build artifacts are generated correctly
- [ ] Domain is accessible

### ✅ Functionality Success
- [ ] All features work as expected
- [ ] No JavaScript errors in console
- [ ] API calls return correct responses
- [ ] Real-time updates work

### ✅ Performance Success
- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 80
- [ ] Core Web Vitals are good
- [ ] Bundle size is optimized

### ✅ Security Success
- [ ] HTTPS is enforced
- [ ] Security headers are present
- [ ] No sensitive data exposed
- [ ] CORS is configured correctly

## 🔄 Maintenance

### ✅ Regular Tasks
- [ ] Monitor Vercel Analytics
- [ ] Check for dependency updates
- [ ] Review performance metrics
- [ ] Update environment variables as needed
- [ ] Monitor error rates

### ✅ Updates
- [ ] Keep Next.js updated
- [ ] Update dependencies regularly
- [ ] Monitor security advisories
- [ ] Test updates in staging first

---

## 🎉 Deployment Complete!

Once all items are checked, your StitchOS RFID Dashboard will be:

- ✅ **Live and accessible** at your Vercel URL
- ✅ **Fully functional** with all features working
- ✅ **Performance optimized** with good Core Web Vitals
- ✅ **Secure** with proper headers and HTTPS
- ✅ **Monitored** with analytics and error tracking
- ✅ **Automatically deployed** on code changes

**Your RFID system is now production-ready on Vercel!** 🚀