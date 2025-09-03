# 🔧 Environment Variables Setup Guide

## 📋 Overview

This guide explains how to properly configure environment variables for the StitchOS RFID Dashboard deployment on Vercel. **No secret references are needed** - all variables are set directly in the Vercel dashboard.

## 🚨 Important Notes

- **No Secret References**: The configuration uses direct environment variable values
- **Client-Side Variables**: All `NEXT_PUBLIC_*` variables are visible in the browser
- **Security**: Never commit sensitive values to your repository
- **Vercel Dashboard**: Set all variables in the Vercel project settings

## 🔧 Required Environment Variables

### Production Environment

Set these in **Vercel Dashboard → Project Settings → Environment Variables**:

| Variable Name | Value | Description | Required |
|---------------|-------|-------------|----------|
| `NEXT_PUBLIC_APP_NAME` | `StitchOS RFID` | Application display name | ✅ |
| `NEXT_PUBLIC_APP_VERSION` | `1.0.0` | Application version | ✅ |
| `NEXT_PUBLIC_APP_ENV` | `production` | Environment identifier | ✅ |
| `NEXT_PUBLIC_API_BASE_URL` | `https://your-backend-domain.com` | Backend API URL | ✅ |
| `NEXT_PUBLIC_WS_URL` | `wss://your-backend-domain.com` | WebSocket URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your_actual_supabase_anon_key` | Supabase anonymous key | ✅ |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | `true` | Enable analytics | ❌ |
| `NEXT_PUBLIC_ENABLE_DEBUG` | `false` | Enable debug mode | ❌ |
| `NEXT_PUBLIC_ENABLE_PWA` | `true` | Enable PWA features | ❌ |

### Preview Environment (Optional)

For staging/preview deployments:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `NEXT_PUBLIC_APP_NAME` | `StitchOS RFID (Preview)` | Preview app name |
| `NEXT_PUBLIC_APP_ENV` | `preview` | Preview environment |
| `NEXT_PUBLIC_API_BASE_URL` | `https://staging-backend-domain.com` | Staging backend |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://staging-project.supabase.co` | Staging Supabase |

## 🚀 Step-by-Step Setup

### 1. Access Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign in to your account
3. Select your project: `stitchos-rfid-frontend`

### 2. Navigate to Environment Variables

1. Click **Settings** tab
2. Click **Environment Variables** in the left sidebar
3. You'll see three sections:
   - **Production** (main deployment)
   - **Preview** (staging/preview deployments)
   - **Development** (local development)

### 3. Add Production Variables

1. **Click "Add New"** in the Production section
2. **Add each variable one by one:**

#### Variable 1: App Name
```
Name: NEXT_PUBLIC_APP_NAME
Value: StitchOS RFID
Environment: Production
```

#### Variable 2: App Version
```
Name: NEXT_PUBLIC_APP_VERSION
Value: 1.0.0
Environment: Production
```

#### Variable 3: App Environment
```
Name: NEXT_PUBLIC_APP_ENV
Value: production
Environment: Production
```

#### Variable 4: API Base URL
```
Name: NEXT_PUBLIC_API_BASE_URL
Value: https://your-backend-domain.com
Environment: Production
```

#### Variable 5: WebSocket URL
```
Name: NEXT_PUBLIC_WS_URL
Value: wss://your-backend-domain.com
Environment: Production
```

#### Variable 6: Supabase URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co
Environment: Production
```

#### Variable 7: Supabase Anon Key
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: your_actual_supabase_anon_key
Environment: Production
```

### 4. Add Preview Variables (Optional)

1. **Click "Add New"** in the Preview section
2. **Add the same variables with preview values:**

```
NEXT_PUBLIC_APP_NAME = StitchOS RFID (Preview)
NEXT_PUBLIC_APP_ENV = preview
NEXT_PUBLIC_API_BASE_URL = https://staging-backend-domain.com
NEXT_PUBLIC_SUPABASE_URL = https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = staging_supabase_anon_key
```

### 5. Save and Deploy

1. **Click "Save"** after adding each variable
2. **Redeploy** your application:
   - Go to **Deployments** tab
   - Click **"Redeploy"** on your latest deployment
   - Or push new code to trigger automatic deployment

## 🔍 How to Get Your Values

### Backend API URL
```bash
# If using local development
NEXT_PUBLIC_API_BASE_URL=http://localhost:8002

# If using production backend
NEXT_PUBLIC_API_BASE_URL=https://api.stitchos.com

# If using Vercel backend
NEXT_PUBLIC_API_BASE_URL=https://your-backend.vercel.app
```

### WebSocket URL
```bash
# If using local development
NEXT_PUBLIC_WS_URL=ws://localhost:8001

# If using production WebSocket
NEXT_PUBLIC_WS_URL=wss://ws.stitchos.com

# If using Vercel WebSocket
NEXT_PUBLIC_WS_URL=wss://your-websocket.vercel.app
```

### Supabase Configuration

1. **Go to [supabase.com](https://supabase.com)**
2. **Select your project**
3. **Go to Settings → API**
4. **Copy the values:**

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co

# Anon/Public Key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🧪 Testing Environment Variables

### 1. Check in Browser Console

After deployment, open your app and check the console:

```javascript
// These should show your configured values
console.log('App Name:', process.env.NEXT_PUBLIC_APP_NAME);
console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
```

### 2. Check Network Tab

1. Open **Developer Tools → Network**
2. Look for API calls to your configured URLs
3. Verify WebSocket connections to your WS URL

### 3. Check Vercel Build Logs

1. Go to **Vercel Dashboard → Deployments**
2. Click on your latest deployment
3. Check **Build Logs** for any environment variable errors

## 🚨 Common Issues & Solutions

### Issue 1: "Environment Variable references Secret which does not exist"

**Problem**: Configuration is trying to reference non-existent secrets.

**Solution**: 
- ✅ Use direct values in Vercel dashboard
- ❌ Don't use `@secret_name` references
- ✅ Set variables directly in Environment Variables section

### Issue 2: Variables not loading in browser

**Problem**: Environment variables aren't available in the client.

**Solution**:
- ✅ Ensure variable names start with `NEXT_PUBLIC_`
- ✅ Redeploy after adding variables
- ✅ Check variable names for typos

### Issue 3: API calls failing

**Problem**: Backend URLs are incorrect.

**Solution**:
- ✅ Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- ✅ Test API endpoint manually
- ✅ Check CORS configuration on backend

### Issue 4: Supabase connection failing

**Problem**: Supabase credentials are incorrect.

**Solution**:
- ✅ Verify `NEXT_PUBLIC_SUPABASE_URL` format
- ✅ Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- ✅ Ensure Supabase project is active

## 🔄 Updating Environment Variables

### Method 1: Vercel Dashboard

1. Go to **Settings → Environment Variables**
2. Click **Edit** on the variable
3. Update the value
4. Click **Save**
5. **Redeploy** your application

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variable
vercel env add NEXT_PUBLIC_API_BASE_URL

# Deploy
vercel --prod
```

### Method 3: GitHub Actions

```yaml
# .github/workflows/deploy-vercel.yml
- uses: amondnet/vercel-action@v20
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.ORG_ID }}
    vercel-project-id: ${{ secrets.PROJECT_ID }}
    working-directory: ./rfid-system/frontend
```

## 📱 Local Development

### Create `.env.local`

```bash
# rfid-system/frontend/.env.local
NEXT_PUBLIC_APP_NAME=StitchOS RFID (Local)
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:8002
NEXT_PUBLIC_WS_URL=ws://localhost:8001
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_supabase_anon_key
NEXT_PUBLIC_ENABLE_DEBUG=true
```

### Start Development Server

```bash
cd rfid-system/frontend
npm install
npm run dev
```

## 🔒 Security Best Practices

### ✅ Do's

- Use `NEXT_PUBLIC_` prefix for client-side variables
- Set sensitive values in Vercel dashboard (not in code)
- Use different values for production/staging/development
- Regularly rotate API keys and tokens
- Monitor environment variable usage

### ❌ Don'ts

- Never commit `.env.local` to repository
- Don't use hardcoded secrets in code
- Avoid sharing environment variable values
- Don't use the same keys across environments

## 📊 Environment Variable Status

### Production Checklist

- [ ] `NEXT_PUBLIC_APP_NAME` set to "StitchOS RFID"
- [ ] `NEXT_PUBLIC_APP_VERSION` set to "1.0.0"
- [ ] `NEXT_PUBLIC_APP_ENV` set to "production"
- [ ] `NEXT_PUBLIC_API_BASE_URL` points to production backend
- [ ] `NEXT_PUBLIC_WS_URL` points to production WebSocket
- [ ] `NEXT_PUBLIC_SUPABASE_URL` points to production Supabase
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid production key
- [ ] Application redeployed after setting variables
- [ ] All variables loading correctly in browser
- [ ] API calls succeeding
- [ ] WebSocket connections working
- [ ] Supabase authentication working

### Preview Checklist (Optional)

- [ ] Preview environment variables configured
- [ ] Different values for staging environment
- [ ] Preview deployments working correctly
- [ ] Staging backend accessible
- [ ] Staging Supabase configured

## 🎯 Quick Setup Commands

```bash
# 1. Access Vercel dashboard
open https://vercel.com/dashboard

# 2. Navigate to your project
# 3. Go to Settings → Environment Variables
# 4. Add each variable with production values
# 5. Redeploy your application

# Alternative: Use Vercel CLI
npm i -g vercel
vercel login
vercel env add NEXT_PUBLIC_APP_NAME
vercel env add NEXT_PUBLIC_API_BASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel --prod
```

## 🆘 Need Help?

### Support Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **GitHub Issues**: [github.com/your-org/stitchos-rfid/issues](https://github.com/your-org/stitchos-rfid/issues)
- **Community**: [vercel.com/community](https://vercel.com/community)

### Common Questions

**Q: Do I need to redeploy after changing environment variables?**
A: Yes, you must redeploy for changes to take effect.

**Q: Can I use different values for different environments?**
A: Yes, Vercel supports separate values for Production, Preview, and Development.

**Q: Are environment variables secure?**
A: `NEXT_PUBLIC_*` variables are visible in the browser. Use server-side variables for secrets.

**Q: How do I check if variables are loaded?**
A: Check browser console or network tab to verify API calls use correct URLs.

---

## 🎉 Environment Setup Complete!

Once all environment variables are configured:

1. ✅ **Production variables** set in Vercel dashboard
2. ✅ **Application redeployed** with new variables
3. ✅ **All features working** with correct configuration
4. ✅ **API connections** established to backend services
5. ✅ **Supabase integration** working properly
6. ✅ **WebSocket connections** established for real-time updates

**Your StitchOS RFID Dashboard is now fully configured and ready for production use!** 🚀