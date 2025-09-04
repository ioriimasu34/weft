# 🚀 Automated Deployment Guide

## 📋 Overview

This guide provides multiple automated deployment options for the StitchOS RFID Dashboard, eliminating the need for manual Vercel dashboard configuration.

## 🎯 Deployment Options

### 1. One-Command Deployment (Recommended)

The simplest way to deploy with automatic environment variable setup:

```bash
# Interactive mode (asks for input)
npm run deploy:now

# Automated mode (uses environment variables)
NEXT_PUBLIC_API_BASE_URL="https://api.stitchos.com" \
NEXT_PUBLIC_WS_URL="wss://ws.stitchos.com" \
NEXT_PUBLIC_SUPABASE_URL="https://project.supabase.co" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_key_here" \
npm run deploy:now -- --auto
```

### 2. Interactive Environment Setup

For guided setup with prompts:

```bash
npm run deploy:interactive
```

### 3. Automated Environment Setup

For CI/CD and automated deployments:

```bash
npm run deploy:auto
```

### 4. GitHub Actions (Fully Automated)

Automated deployment on every push to main branch.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Vercel account
- Vercel CLI (installed automatically)

### One-Command Deployment

```bash
# Navigate to frontend directory
cd rfid-system/frontend

# Run one-command deployment
npm run deploy:now
```

The script will:
1. ✅ Install dependencies
2. ✅ Run tests
3. ✅ Build the application
4. ✅ Install Vercel CLI
5. ✅ Login to Vercel (if needed)
6. ✅ Link to Vercel project
7. ✅ Configure environment variables
8. ✅ Deploy to production
9. ✅ Provide deployment URL

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `https://api.stitchos.com` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | `wss://ws.stitchos.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIs...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_NAME` | Application name | `StitchOS RFID` |
| `NEXT_PUBLIC_APP_VERSION` | Application version | `1.0.0` |
| `NEXT_PUBLIC_APP_ENV` | Environment | `production` |
| `VERCEL_PROJECT_ID` | Vercel project ID | Auto-detected |
| `VERCEL_ORG_ID` | Vercel organization ID | Auto-detected |

## 🎯 Deployment Methods

### Method 1: One-Command Deployment

```bash
# Interactive mode
npm run deploy:now

# Automated mode with environment variables
NEXT_PUBLIC_API_BASE_URL="https://api.stitchos.com" \
NEXT_PUBLIC_WS_URL="wss://ws.stitchos.com" \
NEXT_PUBLIC_SUPABASE_URL="https://project.supabase.co" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_key_here" \
npm run deploy:now -- --auto
```

### Method 2: Interactive Setup

```bash
npm run deploy:interactive
```

This will:
- Guide you through environment variable setup
- Ask for each required value
- Set up both production and preview environments
- Deploy automatically

### Method 3: Automated Setup

```bash
# Set environment variables
export NEXT_PUBLIC_API_BASE_URL="https://api.stitchos.com"
export NEXT_PUBLIC_WS_URL="wss://ws.stitchos.com"
export NEXT_PUBLIC_SUPABASE_URL="https://project.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your_key_here"

# Run automated setup
npm run deploy:auto
```

### Method 4: GitHub Actions

Set up these secrets in your GitHub repository:

```bash
# Required secrets
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
NEXT_PUBLIC_API_BASE_URL=https://api.stitchos.com
NEXT_PUBLIC_WS_URL=wss://ws.stitchos.com
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Optional secrets for preview environment
NEXT_PUBLIC_API_BASE_URL_PREVIEW=https://staging-api.stitchos.com
NEXT_PUBLIC_WS_URL_PREVIEW=wss://staging-ws.stitchos.com
NEXT_PUBLIC_SUPABASE_URL_PREVIEW=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_PREVIEW=staging_supabase_key
```

Then push to main branch for automatic deployment.

## 🔍 Getting Your Values

### Backend API URL

```bash
# Local development
NEXT_PUBLIC_API_BASE_URL=http://localhost:8002

# Production backend
NEXT_PUBLIC_API_BASE_URL=https://api.stitchos.com

# Vercel backend
NEXT_PUBLIC_API_BASE_URL=https://your-backend.vercel.app
```

### WebSocket URL

```bash
# Local development
NEXT_PUBLIC_WS_URL=ws://localhost:8001

# Production WebSocket
NEXT_PUBLIC_WS_URL=wss://ws.stitchos.com

# Vercel WebSocket
NEXT_PUBLIC_WS_URL=wss://your-websocket.vercel.app
```

### Supabase Configuration

1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the values:

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co

# Anon/Public Key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🧪 Testing Your Deployment

### 1. Check Deployment URL

After deployment, you'll get a URL like:
```
https://stitchos-rfid-frontend.vercel.app
```

### 2. Verify Environment Variables

Open browser console and check:
```javascript
console.log('App Name:', process.env.NEXT_PUBLIC_APP_NAME);
console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
```

### 3. Test Functionality

- ✅ Homepage loads
- ✅ Navigation works
- ✅ API calls succeed
- ✅ WebSocket connections work
- ✅ Supabase authentication works

## 🔄 CI/CD Integration

### GitHub Actions

The repository includes automated GitHub Actions workflows:

- **Test on PR**: Runs tests and builds
- **Deploy to Production**: Deploys on push to main
- **Deploy to Preview**: Deploys on PR
- **Lighthouse CI**: Performance testing
- **Security Scan**: Vulnerability scanning

### GitLab CI

Alternative CI/CD pipeline with similar functionality.

## 🚨 Troubleshooting

### Common Issues

#### 1. "Vercel CLI not found"
```bash
# Install Vercel CLI
npm install -g vercel
```

#### 2. "Not logged in to Vercel"
```bash
# Login to Vercel
vercel login
```

#### 3. "Environment variables not set"
```bash
# Check environment variables
echo $NEXT_PUBLIC_API_BASE_URL
echo $NEXT_PUBLIC_SUPABASE_URL
```

#### 4. "Build failed"
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm ci
npm run build
```

#### 5. "Deployment failed"
```bash
# Check Vercel logs
vercel logs

# Check build logs
vercel logs --build
```

### Debug Mode

```bash
# Enable debug logging
VERCEL_DEBUG=1 npm run deploy:now

# Check Vercel project status
vercel ls

# Check environment variables
vercel env ls
```

## 📊 Monitoring

### Vercel Analytics

- **Performance Monitoring**: Core Web Vitals
- **Error Tracking**: JavaScript errors
- **Deployment History**: Build and deployment logs

### External Monitoring

- **Sentry**: Error tracking and performance monitoring
- **Google Analytics**: User behavior analytics
- **Lighthouse**: Performance auditing

## 🔒 Security

### Environment Variables

- ✅ All `NEXT_PUBLIC_*` variables are client-side
- ✅ Sensitive values set in Vercel dashboard
- ✅ Different values for production/staging
- ✅ Regular key rotation recommended

### Best Practices

- Use HTTPS for all URLs
- Validate environment variables
- Monitor for security vulnerabilities
- Keep dependencies updated

## 📚 Additional Resources

### Documentation

- **[ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md)** - Manual environment setup
- **[README-VERCEL.md](./README-VERCEL.md)** - Vercel deployment guide
- **[VERCEL-DEPLOYMENT-CHECKLIST.md](./VERCEL-DEPLOYMENT-CHECKLIST.md)** - Deployment checklist

### Support

- **GitHub Issues**: [Create an issue](https://github.com/your-org/stitchos-rfid/issues)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Documentation**: Check project docs

## 🎯 Quick Commands

```bash
# One-command deployment (interactive)
npm run deploy:now

# One-command deployment (automated)
NEXT_PUBLIC_API_BASE_URL="https://api.stitchos.com" \
NEXT_PUBLIC_SUPABASE_URL="https://project.supabase.co" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_key" \
npm run deploy:now -- --auto

# Interactive environment setup
npm run deploy:interactive

# Automated environment setup
npm run deploy:auto

# Check deployment status
vercel ls

# View logs
vercel logs

# Check environment variables
vercel env ls
```

## 🎉 Success!

After successful deployment, you'll have:

- ✅ **Live Application** at your Vercel URL
- ✅ **Environment Variables** configured automatically
- ✅ **All Features** working correctly
- ✅ **Performance Optimized** with Vercel
- ✅ **Security Headers** configured
- ✅ **Monitoring** set up

**Your StitchOS RFID Dashboard is now production-ready!** 🚀

---

## 💡 Pro Tips

1. **Use Environment Variables**: Set them once and reuse across deployments
2. **Test Locally First**: Run `npm run dev` to test before deploying
3. **Monitor Performance**: Use Vercel Analytics to track Core Web Vitals
4. **Keep Updated**: Regularly update dependencies and Vercel CLI
5. **Backup Configuration**: Save your environment variable values securely

**Happy deploying! 🎉**