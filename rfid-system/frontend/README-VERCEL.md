# 🚀 StitchOS RFID Frontend - Vercel Deployment Guide

## 📋 Overview

This guide covers deploying the StitchOS RFID Dashboard frontend to Vercel, including setup, configuration, and optimization for production use.

## 🎯 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/stitchos-rfid&project-name=stitchos-rfid-frontend&repository-name=stitchos-rfid-frontend)

## 🔧 Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [GitHub Account](https://github.com)
- [Node.js 18+](https://nodejs.org/)
- [npm or yarn](https://npmjs.com/)

## 🚀 Deployment Methods

### Method 1: Vercel Dashboard (Recommended)

1. **Fork/Clone Repository**
   ```bash
   git clone https://github.com/your-org/stitchos-rfid.git
   cd stitchos-rfid/frontend
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder

3. **Configure Project**
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm ci`

4. **Set Environment Variables**
   ```bash
   NEXT_PUBLIC_APP_NAME=StitchOS RFID
   NEXT_PUBLIC_APP_VERSION=1.0.0
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com
   NEXT_PUBLIC_WS_URL=wss://your-backend-domain.com
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build completion
   - Your app will be available at `https://your-project.vercel.app`

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel --prod
   ```

### Method 3: Automated Script

1. **Make Script Executable**
   ```bash
   chmod +x scripts/deploy-vercel.sh
   ```

2. **Update Configuration**
   - Edit `scripts/deploy-vercel.sh`
   - Set your `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`

3. **Run Deployment**
   ```bash
   npm run deploy:vercel
   ```

## ⚙️ Configuration

### Environment Variables

Create `.env.local` for local development:

```bash
# Application
NEXT_PUBLIC_APP_NAME=StitchOS RFID
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENV=development

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8002
NEXT_PUBLIC_WS_URL=ws://localhost:8001

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_supabase_anon_key
```

### Vercel Configuration

The `vercel.json` file includes:

- **Security Headers**: XSS protection, content type options
- **Caching**: Static asset optimization
- **Rewrites**: API and WebSocket proxying
- **Function Configuration**: API route optimization

## 🔒 Security & Performance

### Security Headers

```json
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
}
```

### Performance Optimizations

- **SWC Minification**: Faster builds
- **Bundle Optimization**: Code splitting and tree shaking
- **Static Generation**: Pre-rendered pages
- **Image Optimization**: Next.js Image component
- **Caching**: Aggressive static asset caching

## 📱 Progressive Web App (PWA)

The application includes PWA features:

- **Offline Support**: Service worker for offline functionality
- **Install Prompt**: Add to home screen capability
- **App-like Experience**: Full-screen mode and navigation

## 🧪 Testing

### Run Tests Locally

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:ci

# Run tests in watch mode
npm test -- --watch
```

### Test Coverage

- **Unit Tests**: Component and utility testing
- **Integration Tests**: API and state management
- **E2E Tests**: User workflow testing
- **Coverage Threshold**: 70% minimum

## 📊 Monitoring & Analytics

### Vercel Analytics

- **Performance Monitoring**: Core Web Vitals
- **Error Tracking**: JavaScript errors and exceptions
- **User Analytics**: Page views and user behavior
- **Real-time Metrics**: Live performance data

### Custom Monitoring

```bash
# Health Check Endpoint
GET /api/health

# Performance Metrics
GET /api/metrics

# Error Logging
POST /api/logs
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### GitLab CI

```yaml
deploy:vercel:
  stage: deploy
  script:
    - npm ci
    - npm run build
    - npm run deploy:vercel
  only:
    - main
```

## 🌐 Custom Domain

### Add Custom Domain

1. **Vercel Dashboard**
   - Go to Project Settings
   - Click "Domains"
   - Add your domain

2. **DNS Configuration**
   ```bash
   # Add CNAME record
   CNAME: rfid.stitchos.com -> cname.vercel-dns.com
   
   # Or A record
   A: rfid.stitchos.com -> 76.76.19.76
   ```

3. **SSL Certificate**
   - Vercel automatically provisions SSL
   - Supports HTTP/2 and HTTP/3

## 📈 Performance Optimization

### Core Web Vitals

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Optimization Techniques

- **Code Splitting**: Route-based and component-based
- **Lazy Loading**: Images and components
- **Preloading**: Critical resources
- **Caching**: Browser and CDN caching

## 🐛 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache
rm -rf .next node_modules
npm ci
npm run build

# Check Node.js version
node --version  # Should be 18+
```

#### Environment Variables

```bash
# Verify environment variables
vercel env ls

# Set missing variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
```

#### Performance Issues

```bash
# Analyze bundle
npm run analyze

# Check Core Web Vitals
# Use Vercel Analytics dashboard
```

### Debug Mode

```bash
# Enable debug logging
VERCEL_DEBUG=1 vercel

# View detailed logs
vercel logs
```

## 📚 Additional Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

### Support

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **GitHub Issues**: [github.com/your-org/stitchos-rfid/issues](https://github.com/your-org/stitchos-rfid/issues)
- **Community**: [vercel.com/community](https://vercel.com/community)

### Monitoring Tools

- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **Google Analytics**: User behavior analytics
- **Lighthouse**: Performance auditing

## 🎯 Next Steps

1. **Deploy to Vercel** using one of the methods above
2. **Configure Environment Variables** in Vercel dashboard
3. **Set up Custom Domain** if needed
4. **Configure Backend API** endpoints
5. **Test All Functionality** in production environment
6. **Monitor Performance** using Vercel Analytics
7. **Set up Alerts** for performance and error thresholds

---

## 🚀 Ready to Deploy?

Your StitchOS RFID frontend is now fully optimized for Vercel deployment with:

- ✅ **Performance Optimizations** - SWC, bundle splitting, caching
- ✅ **Security Headers** - XSS protection, content security
- ✅ **Testing Setup** - Jest configuration with coverage
- ✅ **CI/CD Ready** - GitHub Actions and GitLab CI
- ✅ **Monitoring** - Vercel Analytics integration
- ✅ **PWA Support** - Offline functionality and app-like experience

**Deploy now and start monitoring your RFID system in production!** 🎉