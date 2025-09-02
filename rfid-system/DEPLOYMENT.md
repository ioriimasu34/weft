# 🚀 StitchOS RFID System - Deployment Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Local Development](#local-development)
4. [Staging Deployment](#staging-deployment)
5. [Production Deployment](#production-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / macOS 12+
- **CPU**: 4+ cores (8+ recommended for production)
- **RAM**: 8GB+ (16GB+ recommended for production)
- **Storage**: 100GB+ SSD
- **Network**: Stable internet connection

### Software Requirements
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: 2.30+
- **Make**: 4.0+
- **Python**: 3.11+
- **Node.js**: 18+
- **Flutter**: 3.16+ (for mobile builds)

### Cloud Services
- **Supabase**: PostgreSQL database + authentication
- **Vercel**: Frontend hosting (optional)
- **Fly.io/Render**: Backend hosting (optional)
- **GitLab**: CI/CD pipeline

## 🌍 Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/stitchos-rfid.git
cd stitchos-rfid
```

### 2. Environment Variables
Create `.env` files for each environment:

#### Local Development (.env.local)
```bash
# Application
APP_NAME=StitchOS RFID
APP_ENV=local
DEBUG=true
LOG_LEVEL=DEBUG

# Server
HOST=0.0.0.0
PORT=8001
WORKERS=4

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/rfid_system
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRY=3600

# RFID Readers
RFID_READER_TIMEOUT=30
RFID_READER_RETRY_ATTEMPTS=3

# Security
CORS_ORIGINS=http://localhost:3000,http://localhost:8001
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
```

#### Production (.env.prod)
```bash
# Application
APP_NAME=StitchOS RFID
APP_ENV=production
DEBUG=false
LOG_LEVEL=INFO

# Server
HOST=0.0.0.0
PORT=8001
WORKERS=8

# Database
DATABASE_URL=postgresql://user:password@prod-db:5432/rfid_system
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_prod_anon_key
SUPABASE_SERVICE_KEY=your_prod_service_key

# Redis
REDIS_URL=redis://prod-redis:6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_production_jwt_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRY=3600

# RFID Readers
RFID_READER_TIMEOUT=30
RFID_READER_RETRY_ATTEMPTS=3

# Security
CORS_ORIGINS=https://rfid.stitchos.com,https://admin.stitchos.com
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=60
```

### 3. Supabase Setup
1. Create new project at [supabase.com](https://supabase.com)
2. Get project URL and API keys
3. Run database migrations:
```bash
cd infrastructure/supabase
psql -h your-project.supabase.co -U postgres -d postgres -f migrations/001_initial_schema.sql
psql -h your-project.supabase.co -U postgres -d postgres -f migrations/002_rls_policies.sql
```

## 🏠 Local Development

### 1. Start Infrastructure
```bash
# Start all services
make run

# Or start individual services
make start-db
make start-redis
make start-supabase
```

### 2. Backend Development
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run RFID Ingest Service
cd rfid_ingest
uvicorn main:app --reload --host 0.0.0.0 --port 8001

# Run Core API Service
cd ../core_api
uvicorn main:app --reload --host 0.0.0.0 --port 8002

# Run Real-time Service
cd ../realtime
uvicorn main:app --reload --host 0.0.0.0 --port 8003
```

### 3. Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### 4. Mobile Development
```bash
cd mobile

# Install dependencies
flutter pub get

# Run on device/emulator
flutter run

# Build APK
flutter build apk --release
```

### 5. Testing
```bash
# Run all tests
make test

# Run specific test suites
make test-backend
make test-frontend
make test-mobile

# Run with coverage
make test-coverage
```

## 🚀 Staging Deployment

### 1. Server Setup
```bash
# Connect to staging server
ssh user@staging-server

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Deploy Application
```bash
# Clone repository
git clone https://github.com/your-org/stitchos-rfid.git
cd stitchos-rfid

# Create environment file
cp .env.staging .env

# Start services
docker-compose -f infrastructure/docker-compose.yml up -d

# Run database migrations
make db-migrate

# Check status
make status
```

### 3. Configure Nginx
```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Create site configuration
sudo nano /etc/nginx/sites-available/stitchos-rfid

# Enable site
sudo ln -s /etc/nginx/sites-available/stitchos-rfid /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🏭 Production Deployment

### 1. High Availability Setup
```bash
# Load balancer configuration
# Use HAProxy or Nginx for load balancing

# Database clustering
# Set up PostgreSQL with streaming replication

# Redis clustering
# Configure Redis Sentinel for failover
```

### 2. Security Hardening
```bash
# Firewall configuration
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 8001:8003

# SSL/TLS certificates
sudo certbot --nginx -d rfid.stitchos.com

# Regular security updates
sudo apt update && sudo apt upgrade -y
```

### 3. Monitoring Setup
```bash
# Install monitoring stack
docker-compose -f infrastructure/monitoring.yml up -d

# Configure alerts
# Set up Prometheus alerting rules
# Configure Grafana dashboards
# Set up log aggregation (ELK stack)
```

### 4. Backup Strategy
```bash
# Database backups
make backup

# File backups
make backup-files

# Automated backup script
crontab -e
# Add: 0 2 * * * /path/to/stitchos-rfid/make backup
```

## 📊 Monitoring & Maintenance

### 1. Health Checks
```bash
# Check service status
make status

# View logs
make logs

# Monitor resources
make monitor

# Check database health
make db-health
```

### 2. Performance Monitoring
```bash
# View metrics
# Access Grafana: http://your-server:3000
# Default credentials: admin/admin

# Check API performance
curl -w "@curl-format.txt" -o /dev/null -s "http://your-server:8002/api/health"

# Monitor RFID reader performance
make rfid-status
```

### 3. Log Management
```bash
# View real-time logs
make logs-follow

# Search logs
make logs-search "error"

# Log rotation
# Configure logrotate for application logs
```

### 4. Updates & Maintenance
```bash
# Update application
git pull origin main
make deploy

# Update dependencies
make update-deps

# Database maintenance
make db-maintenance

# System updates
make system-update
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database status
make db-status

# Test connection
make db-test

# Reset database
make db-reset
```

#### 2. RFID Reader Issues
```bash
# Check reader status
make rfid-status

# Test reader connection
make rfid-test

# Reset reader configuration
make rfid-reset
```

#### 3. Performance Issues
```bash
# Check resource usage
make monitor

# Optimize database
make db-optimize

# Check for bottlenecks
make perf-test
```

#### 4. Authentication Issues
```bash
# Check JWT configuration
make auth-check

# Reset user passwords
make auth-reset-password

# Check Supabase connection
make supabase-status
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