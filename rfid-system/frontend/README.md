# 🚀 StitchOS RFID Dashboard Frontend

## 📋 Overview

A modern, responsive Next.js 14 dashboard for real-time RFID tracking in textile & apparel factories. Built with TypeScript, Tailwind CSS, and optimized for Vercel deployment.

## 🚀 Automated Deployment (Recommended)

**Deploy with one command - no manual configuration needed!**

```bash
# One-command deployment (interactive)
npm run deploy:now

# One-command deployment (automated)
NEXT_PUBLIC_API_BASE_URL="https://api.stitchos.com" \
NEXT_PUBLIC_SUPABASE_URL="https://project.supabase.co" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_key_here" \
npm run deploy:now -- --auto
```

📖 **See [AUTOMATED-DEPLOYMENT.md](./AUTOMATED-DEPLOYMENT.md) for complete automated deployment guide.**

## 🔧 Manual Environment Variables Setup (Alternative)

**If you prefer manual setup:**

📖 **See [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md) for manual setup instructions.**

### Quick Manual Setup:
1. Go to **Vercel Dashboard → Project Settings → Environment Variables**
2. Add these required variables:
   - `NEXT_PUBLIC_APP_NAME` = "StitchOS RFID"
   - `NEXT_PUBLIC_API_BASE_URL` = "https://your-backend-domain.com"
   - `NEXT_PUBLIC_SUPABASE_URL` = "https://your-project.supabase.co"
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = "your_supabase_anon_key"

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Vercel account (free Hobby plan supported)

### Local Development

```bash
# Clone repository
git clone https://github.com/your-org/stitchos-rfid.git
cd stitchos-rfid/frontend

# Install dependencies
npm install

# Create environment file
cp .env.vercel.template .env.local
# Edit .env.local with your local values

# Start development server
npm run dev
```

### Deploy to Vercel

```bash
# One-command deployment (recommended)
npm run deploy:now

# Interactive environment setup
npm run deploy:interactive

# Automated environment setup
npm run deploy:auto

# Traditional Vercel CLI deployment
npm i -g vercel
vercel --prod
```

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + React Query
- **Real-time**: WebSocket + Socket.io
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (Hobby plan compatible)

### Key Features

- **Real-time Dashboard**: Live RFID scan updates
- **Production Tracking**: Monitor sewing lines and efficiency
- **Uniform Management**: Track employee uniforms and returns
- **System Status**: Monitor RFID readers and services
- **Responsive Design**: Works on all devices
- **PWA Support**: Offline functionality

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── scripts/                # Deployment scripts
├── vercel.json            # Vercel configuration
├── next.config.js         # Next.js configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

## ⚙️ Configuration

### Environment Variables

**Required for production deployment:**

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_NAME` | Application name | `StitchOS RFID` |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `https://api.stitchos.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIs...` |

📖 **See [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md) for detailed setup instructions.**

### Vercel Configuration

The `vercel.json` file includes:
- Security headers (XSS protection, content security)
- API and WebSocket rewrites
- Function optimization
- **Hobby plan compatible** (no multi-region restrictions)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:ci

# Run tests in watch mode
npm test -- --watch
```

## 📊 Performance

### Core Web Vitals Targets

- **LCP**: < 2.5s
- **FID**: < 100ms  
- **CLS**: < 0.1

### Optimization Features

- SWC minification
- Bundle splitting and tree shaking
- Image optimization
- Static generation
- Aggressive caching

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Import from GitHub
2. **Set Root Directory**: `frontend`
3. **Configure Environment Variables** (see [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md))
4. **Deploy**: Automatic deployment on push

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Or use automated script
npm run deploy:vercel
```

## 🔒 Security

### Security Headers

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

### Best Practices

- Environment variables for configuration
- No sensitive data in client code
- HTTPS enforcement
- CORS configuration
- Input validation

## 📱 PWA Features

- Offline functionality
- Install prompt
- App-like experience
- Service worker
- Manifest file

## 🔄 CI/CD

### GitHub Actions

Automated deployment pipeline:
- Test on pull requests
- Deploy to production (main branch)
- Deploy to preview (develop branch)
- Performance testing with Lighthouse CI

### GitLab CI

Alternative CI/CD pipeline with:
- Testing and building
- Security scanning
- Performance optimization
- Automated deployment

## 📚 Documentation

- **[AUTOMATED-DEPLOYMENT.md](./AUTOMATED-DEPLOYMENT.md)** - Automated deployment guide (recommended)
- **[ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md)** - Manual environment variables setup
- **[README-VERCEL.md](./README-VERCEL.md)** - Vercel deployment guide
- **[VERCEL-DEPLOYMENT-CHECKLIST.md](./VERCEL-DEPLOYMENT-CHECKLIST.md)** - Deployment checklist
- **[API Documentation](http://localhost:8002/docs)** - Backend API reference

## 🆘 Support

### Common Issues

1. **Environment Variables Not Loading**
   - Check variable names start with `NEXT_PUBLIC_`
   - Redeploy after adding variables
   - Verify in Vercel dashboard

2. **Build Failures**
   - Check Node.js version (18+)
   - Clear cache: `rm -rf .next node_modules`
   - Reinstall: `npm ci`

3. **API Connection Issues**
   - Verify `NEXT_PUBLIC_API_BASE_URL`
   - Check CORS configuration
   - Test API endpoint manually

### Getting Help

- **GitHub Issues**: [Create an issue](https://github.com/your-org/stitchos-rfid/issues)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Documentation**: Check project docs and guides

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic dashboard functionality
- ✅ Real-time data display
- ✅ Responsive design
- ✅ Vercel deployment

### Phase 2 (Next)
- [ ] Advanced analytics
- [ ] User management
- [ ] Role-based access control
- [ ] Mobile app integration

### Phase 3 (Future)
- [ ] Predictive analytics
- [ ] Multi-site support
- [ ] Advanced reporting
- [ ] Integration with StitchOS core

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## 🎉 Ready to Deploy?

Your StitchOS RFID Dashboard is now ready for production deployment on Vercel!

**Next Steps:**
1. 🚀 **Run `npm run deploy:now` for one-command deployment**
2. 📖 **Or read [AUTOMATED-DEPLOYMENT.md](./AUTOMATED-DEPLOYMENT.md) for detailed guide**
3. 🧪 **Test all functionality**
4. 📊 **Monitor performance**

**Need help?** Check the documentation or create an issue on GitHub.

---

**Built with ❤️ for the textile industry by StitchOS Team**