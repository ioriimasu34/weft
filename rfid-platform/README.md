# 🏭 RFID Platform - Production Software

## 📋 Overview

Enterprise-grade RFID tracking platform for textile & apparel factories. Built with modern microservices architecture, real-time processing, and multi-tenant SaaS capabilities.

## 🏗️ Architecture

```
RFID Readers → API Gateway → Message Bus → Workers → Database
     ↓              ↓            ↓          ↓         ↓
  LLRP/MQTT    FastAPI      Redis      Python    Supabase
  HTTP+HMAC    Auth/Rate    Streams    Workers   Postgres
```

## 🚀 Quick Start

```bash
# Setup development environment
pnpm setup

# Start full stack locally
pnpm dev

# Run tests
pnpm test

# Deploy to production
pnpm deploy
```

## 📁 Project Structure

```
rfid-platform/
├── apps/
│   ├── dashboard/        # Next.js 14 (Vercel)
│   ├── gateway/          # FastAPI REST (Fly/Render)
│   ├── ingest-worker/    # Python worker (Fly/Render)
│   ├── realtime/         # WS/SSE service (optional)
│   └── mobile/           # Flutter app (Android first)
├── infra/
│   ├── supabase/         # SQL migrations, RLS policies, seeds
│   └── docker/           # Dockerfiles, docker-compose
├── packages/
│   └── shared/           # TS/Py shared types, utils, contracts
├── docs/                 # DEPLOY, SECURITY, OPS, DB, API
└── .github/workflows/    # CI: check, e2e, deploy
```

## 🎯 Features

### Core Platform
- **Multi-tenant SaaS** with org-level isolation
- **Real-time processing** with Redis Streams
- **Partitioned database** with 90-day retention
- **HMAC authentication** for device security
- **Rate limiting** and request tracing

### RFID Integration
- **LLRP support** for Impinj/Zebra readers
- **Mobile SDK integration** for handheld devices
- **CloudEvents format** for standardized data
- **Deduplication** and idempotent processing

### Dashboard & Mobile
- **Real-time dashboard** with live feeds
- **Offline-capable mobile app** with sync
- **CSV/PDF exports** and analytics
- **Role-based access control**

## 🔧 Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- Flutter 3.0+
- Docker & Docker Compose
- Supabase CLI
- Redis (Upstash or local)

### Environment Setup
```bash
# Copy environment templates
cp .env.example .env.local
cp apps/dashboard/.env.example apps/dashboard/.env.local
cp apps/gateway/.env.example apps/gateway/.env.local

# Install dependencies
pnpm install

# Setup database
pnpm migrate
pnpm seed

# Start development servers
pnpm dev
```

## 🚀 Deployment

### Production Deployment
```bash
# Deploy dashboard to Vercel
pnpm deploy:dashboard

# Deploy APIs to Fly/Render
pnpm deploy:gateway
pnpm deploy:worker

# Deploy mobile app
pnpm deploy:mobile
```

### Environment Variables
See `docs/DEPLOY.md` for complete environment configuration.

## 📊 Performance Targets

- **Ingest**: 1k reads/sec sustained, 5k burst
- **Latency**: p95 ingest→commit < 250ms
- **Availability**: 99.9% uptime
- **Security**: RLS isolation, HMAC validation

## 🔒 Security

- **Multi-tenant isolation** with RLS policies
- **HMAC authentication** for device communication
- **Rate limiting** and request tracing
- **Audit trails** and compliance logging

## 📚 Documentation

- **[DEPLOY.md](docs/DEPLOY.md)** - Deployment guide
- **[SECURITY.md](docs/SECURITY.md)** - Security policies
- **[OPS.md](docs/OPS.md)** - Operations guide
- **[DB.md](docs/DB.md)** - Database schema
- **[API.md](docs/API.md)** - API documentation

## 🧪 Testing

```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# E2E tests
pnpm e2e

# Load testing
pnpm load-test
```

## 📈 Monitoring

- **OpenTelemetry** for distributed tracing
- **Sentry** for error tracking
- **Prometheus** for metrics
- **Grafana** for dashboards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built for the textile industry by StitchOS Team** 🏭