# 🚀 Deployment Guide

## 📋 Overview

This guide covers deploying the RFID Platform to production environments. The platform consists of multiple services that can be deployed independently or together.

## 🏗️ Architecture

```
┌─────────────────┐   ┌─────────────────┐   ┌────────────────────┐
│ RFID Readers    │   │  Mobile App     │   │  Admin Dashboard   │
│ (Impinj/Zebra)  │   │  (Flutter)      │   │  (Next.js 14)      │
└───────┬─────────┘   └─────────┬───────┘   └──────────┬─────────┘
        │  LLRP/MQTT/HTTP               HTTPS/Auth                │
        ▼                              ▼                         ▼
                    ┌──────────────────────────────────────────┐
                    │            API Gateway (FastAPI)         │
                    │  AuthN/Z, rate limit, request tracing    │
                    └───────┬───────────────┬───────────────┬──┘
                            │               │               │
                            ▼               ▼               ▼
                  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
                  │ Ingest Edge  │  │ Core API     │  │ Realtime Svc │
                  │ (adapters)   │  │ (REST/Graph) │  │ (WS/SSE)     │
                  └───────┬──────┘  └──────┬───────┘  └──────┬───────┘
                          │                 │                 │
                          ▼                 │                 │
                   ┌───────────────┐       │                 │
                   │  Message Bus  │◄──────┘                 │
                   │ (Redis Streams)│  publish events         │
                   └──────┬────────┘                         │
                          ▼                                  │
                 ┌────────────────┐                          │
                 │ Ingest Worker  │  batch, dedupe,          │
                 │ (Python)       │  idempotent writes       │
                 └───────┬────────┘                          │
                         ▼                                   ▼
        ┌──────────────────────────────────────────────────────────┐
        │                       Supabase                           │
        │  Postgres (RLS, partitions) • Auth • Storage • Realtime  │
        └──────────┬───────────────┬───────────────┬───────────────┘
                   ▼               ▼               ▼
           ┌────────────┐   ┌──────────────┐  ┌───────────────┐
           │  Cache     │   │ Analytics/ETL│  │ Observability  │
           │ (Redis)    │   │ (dbt/Views)  │  │ (OTel+Sentry)  │
           └────────────┘   └──────────────┘  └───────────────┘
```

## 🎯 Deployment Options

### Option 1: Automated Deployment (Recommended)

Use GitHub Actions for automated deployment:

```bash
# Deploy to production
git push origin main

# Deploy to staging
git push origin develop

# Manual deployment
gh workflow run deploy.yml -f environment=production
```

### Option 2: Manual Deployment

Deploy each service individually:

```bash
# Dashboard (Vercel)
cd apps/dashboard
vercel --prod

# Gateway (Fly.io)
cd apps/gateway
flyctl deploy

# Worker (Fly.io)
cd apps/ingest-worker
flyctl deploy

# Mobile (Build APK)
cd apps/mobile
flutter build apk --release
```

## 🔧 Prerequisites

### Required Services

- **Supabase**: Database, Auth, Realtime
- **Redis**: Message bus and caching
- **Vercel**: Dashboard hosting
- **Fly.io**: API and worker hosting

### Required Tools

- Node.js 18+
- Python 3.11+
- Flutter 3.0+
- Docker & Docker Compose
- Supabase CLI
- Vercel CLI
- Fly CLI

### Required Secrets

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_PROJECT_REF=your_project_ref
SUPABASE_ACCESS_TOKEN=your_access_token

# Redis
REDIS_URL=redis://localhost:6379

# Vercel
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

# Fly.io
FLY_API_TOKEN=your_fly_token

# Monitoring
SENTRY_DSN=your_sentry_dsn
JAEGER_HOST=localhost
JAEGER_PORT=14268

# Notifications
SLACK_WEBHOOK_URL=your_slack_webhook
EMAIL_USERNAME=your_email
EMAIL_PASSWORD=your_password
NOTIFICATION_EMAIL=admin@yourcompany.com
```

## 🚀 Step-by-Step Deployment

### 1. Setup Supabase

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Create new project
supabase projects create rfid-platform

# Get project details
supabase projects list
```

### 2. Setup Redis

#### Option A: Upstash (Recommended for Production)

```bash
# Create Upstash account
# Create Redis database
# Get connection URL
REDIS_URL=redis://default:password@host:port
```

#### Option B: Self-hosted

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Using Docker Compose
docker-compose up -d redis
```

### 3. Deploy Dashboard (Vercel)

```bash
cd apps/dashboard

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_API_BASE_URL
```

### 4. Deploy Gateway (Fly.io)

```bash
cd apps/gateway

# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login to Fly
flyctl auth login

# Create app
flyctl apps create rfid-gateway

# Deploy
flyctl deploy

# Set secrets
flyctl secrets set SUPABASE_URL=your_url
flyctl secrets set SUPABASE_SERVICE_KEY=your_key
flyctl secrets set REDIS_URL=your_redis_url
flyctl secrets set SECRET_KEY=your_secret_key
```

### 5. Deploy Worker (Fly.io)

```bash
cd apps/ingest-worker

# Create app
flyctl apps create rfid-worker

# Deploy
flyctl deploy

# Set secrets
flyctl secrets set SUPABASE_URL=your_url
flyctl secrets set SUPABASE_SERVICE_KEY=your_key
flyctl secrets set REDIS_URL=your_redis_url
flyctl secrets set WORKER_ID=worker-1
```

### 6. Deploy Mobile App

```bash
cd apps/mobile

# Install Flutter
# Setup Android/iOS development environment

# Build APK
flutter build apk --release

# Build iOS (requires macOS)
flutter build ios --release
```

## 🔧 Environment Configuration

### Dashboard Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# API
NEXT_PUBLIC_API_BASE_URL=https://your-gateway.fly.dev
NEXT_PUBLIC_WS_URL=wss://your-gateway.fly.dev

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_ENABLE_PWA=true
```

### Gateway Environment Variables

```bash
# Environment
ENVIRONMENT=production
DEBUG=false

# API
API_HOST=0.0.0.0
API_PORT=8000

# Security
SECRET_KEY=your_secret_key
ALLOWED_ORIGINS=https://your-dashboard.vercel.app
ALLOWED_HOSTS=your-gateway.fly.dev

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key

# Redis
REDIS_URL=redis://your-redis-url

# Rate Limiting
RATE_LIMITING_ENABLED=true

# Monitoring
TELEMETRY_ENABLED=true
METRICS_ENABLED=true
SENTRY_DSN=your_sentry_dsn
JAEGER_HOST=your_jaeger_host
JAEGER_PORT=14268
```

### Worker Environment Variables

```bash
# Environment
ENVIRONMENT=production
DEBUG=false

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key

# Redis
REDIS_URL=redis://your-redis-url

# Worker
WORKER_ID=worker-1
BATCH_SIZE=100
PENDING_ENTRIES_LIMIT=1000

# Monitoring
TELEMETRY_ENABLED=true
SENTRY_DSN=your_sentry_dsn
JAEGER_HOST=your_jaeger_host
JAEGER_PORT=14268
```

## 🧪 Testing Deployment

### 1. Health Checks

```bash
# Dashboard
curl https://your-dashboard.vercel.app

# Gateway
curl https://your-gateway.fly.dev/v1/health

# Worker (if exposed)
curl https://your-worker.fly.dev/health
```

### 2. Database Connection

```bash
# Test Supabase connection
supabase db ping --project-ref your_project_ref

# Test Redis connection
redis-cli -u your_redis_url ping
```

### 3. End-to-End Testing

```bash
# Run E2E tests
cd apps/dashboard
npm run e2e

# Run load tests
cd scripts
locust -f load_test.py --host=https://your-gateway.fly.dev
```

## 📊 Monitoring & Observability

### 1. Application Metrics

- **Vercel Analytics**: Dashboard performance
- **Fly.io Metrics**: API and worker performance
- **Supabase Metrics**: Database performance
- **Redis Metrics**: Cache and message bus performance

### 2. Error Tracking

- **Sentry**: Application errors and performance
- **Jaeger**: Distributed tracing
- **Prometheus**: Custom metrics

### 3. Logs

```bash
# Gateway logs
flyctl logs -a rfid-gateway

# Worker logs
flyctl logs -a rfid-worker

# Supabase logs
supabase logs --project-ref your_project_ref
```

## 🔒 Security Considerations

### 1. Environment Variables

- Never commit secrets to version control
- Use environment-specific values
- Rotate keys regularly
- Use least privilege access

### 2. Network Security

- Enable HTTPS everywhere
- Use CORS properly
- Implement rate limiting
- Use WAF if available

### 3. Database Security

- Enable RLS policies
- Use service role keys carefully
- Monitor access patterns
- Regular security audits

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Failed

```bash
# Check Supabase status
supabase status

# Verify connection string
supabase db ping --project-ref your_project_ref

# Check RLS policies
supabase db diff --project-ref your_project_ref
```

#### 2. Redis Connection Failed

```bash
# Test Redis connection
redis-cli -u your_redis_url ping

# Check Redis logs
docker logs redis_container

# Verify Redis configuration
redis-cli -u your_redis_url config get "*"
```

#### 3. Gateway Deployment Failed

```bash
# Check Fly.io status
flyctl status -a rfid-gateway

# View deployment logs
flyctl logs -a rfid-gateway

# Check secrets
flyctl secrets list -a rfid-gateway
```

#### 4. Worker Not Processing Messages

```bash
# Check worker logs
flyctl logs -a rfid-worker

# Check Redis streams
redis-cli -u your_redis_url xinfo streams org:ktl:rfid

# Check consumer groups
redis-cli -u your_redis_url xinfo groups org:ktl:rfid
```

### Performance Issues

#### 1. High Latency

- Check Redis performance
- Monitor database queries
- Review API response times
- Check network connectivity

#### 2. Memory Usage

- Monitor worker memory
- Check Redis memory usage
- Review database connections
- Optimize queries

#### 3. Throughput Issues

- Scale worker instances
- Optimize batch sizes
- Check rate limits
- Monitor queue depths

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale gateway
flyctl scale count 3 -a rfid-gateway

# Scale worker
flyctl scale count 5 -a rfid-worker

# Scale Redis (if self-hosted)
docker-compose up -d --scale redis=3
```

### Vertical Scaling

```bash
# Increase gateway resources
flyctl scale vm shared-cpu-1x -a rfid-gateway

# Increase worker resources
flyctl scale vm shared-cpu-2x -a rfid-worker
```

## 🔄 Maintenance

### Regular Tasks

- **Daily**: Monitor system health
- **Weekly**: Review performance metrics
- **Monthly**: Update dependencies
- **Quarterly**: Security audits

### Backup Strategy

- **Database**: Supabase automatic backups
- **Redis**: Regular snapshots
- **Code**: Git repository
- **Secrets**: Secure storage

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Fly.io Documentation](https://fly.io/docs)
- [Redis Documentation](https://redis.io/docs)
- [Flutter Documentation](https://flutter.dev/docs)

---

## 🎉 Deployment Complete!

Your RFID Platform is now deployed and ready for production use!

**Next Steps:**
1. Configure your RFID readers
2. Set up monitoring alerts
3. Train your team
4. Monitor system performance
5. Plan for scaling

**Need Help?**
- Check the troubleshooting section
- Review the logs
- Contact the development team
- Create an issue on GitHub