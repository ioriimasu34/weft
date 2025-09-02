# 🏭 StitchOS RFID Tracking System

**Real-time RFID tracking system for textile & apparel factories**

## 🎯 Overview

This system provides comprehensive RFID-based tracking solutions for:
- **TextileTrack** → Real-time RFID tracking of textile assets
- **Uniforms.** → SaaS solution for RFID-based uniform/laundry management  
- **Production Tracking** → RFID tracking in sewing lines (cut → issue → station → finish)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   RFID Readers  │    │  Mobile App     │    │  Admin Dashboard│
│   (Impinj/Zebra)│    │  (Flutter)      │    │  (Next.js 14)   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway (FastAPI)                       │
└─────────┬───────────────────────┬─────────────────────┬───────┘
          │                       │                     │
          ▼                       ▼                     ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ RFID Ingest     │    │  Core API       │    │  Real-time      │
│ Service         │    │  Service        │    │  Service        │
│ (FastAPI)       │    │  (FastAPI)      │    │  (WebSocket)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                       │                     │
          └───────────────────────┼─────────────────────┘
                                  ▼
                       ┌─────────────────┐
                       │   Supabase      │
                       │   (PostgreSQL)  │
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- Flutter 3.16+

### 1. Start Infrastructure
```bash
cd infrastructure
docker-compose up -d
```

### 2. Start Backend Services
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn rfid_ingest.main:app --reload --port 8001
uvicorn core_api.main:app --reload --port 8002
uvicorn realtime.main:app --reload --port 8003
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Start Mobile App
```bash
cd mobile
flutter pub get
flutter run
```

## 📁 Project Structure

```
rfid-system/
├── infrastructure/          # Docker & database setup
├── backend/                # Python FastAPI services
│   ├── rfid_ingest/       # RFID reader event ingestion
│   ├── core_api/          # Main business logic API
│   ├── realtime/          # WebSocket real-time service
│   └── shared/            # Shared utilities & models
├── frontend/               # Next.js 14 admin dashboard
├── mobile/                 # Flutter mobile app
├── docs/                   # API documentation & schemas
└── tools/                  # Testing & simulation tools
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/rfid_tracking
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# RFID Readers
RFID_READER_IP=192.168.1.100
RFID_READER_PORT=5084

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

## 📊 Features

### Admin Dashboard
- ✅ Real-time scan feed with WebSockets
- ✅ Date range filters & checkpoint selection
- ✅ CSV/PDF export functionality
- ✅ Multi-tenant factory isolation
- ✅ Role-based access control

### Mobile App
- ✅ Offline-first design with local SQLite
- ✅ Supabase authentication
- ✅ Real-time sync when online
- ✅ APK generation ready

### Backend Services
- ✅ RFID event ingestion & processing
- ✅ Secure API with JWT authentication
- ✅ Real-time WebSocket updates
- ✅ Comprehensive logging & monitoring

## 🧪 Testing

### RFID Data Simulation
```bash
cd tools
python simulate_rfid_data.py --tags 150 --duration 300
```

### API Testing
```bash
cd backend
pytest tests/ -v
```

### Load Testing
```bash
cd tools
python load_test.py --users 100 --duration 60
```

## 🚀 Deployment

### Production
```bash
# Build & deploy
make build
make deploy

# Monitor
make logs
make status
```

### CI/CD Pipeline
- GitLab CI/CD with Docker builds
- Automated testing & deployment
- Environment-specific configurations

## 📈 Performance Metrics

- **Latency**: <100ms for RFID event processing
- **Throughput**: 1000+ tags/second per reader
- **Uptime**: 99.9% availability target
- **Scalability**: Support for 10+ factories, 1000+ users

## 🔒 Security Features

- Multi-tenant isolation with RLS policies
- JWT-based authentication
- Role-based access control
- Encrypted data transmission
- Audit logging for compliance

## 📞 Support

For technical support or questions:
- **Email**: tech@kattalitextile.com
- **Slack**: #stitchos-rfid
- **Documentation**: [docs.stitchos.com](https://docs.stitchos.com)

---

**Built with ❤️ for Kattali Textile Ltd.**