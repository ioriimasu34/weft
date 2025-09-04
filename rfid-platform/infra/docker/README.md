# RFID Platform - Docker Infrastructure

This directory contains Docker configuration for local development and production deployment of the RFID Platform.

## Quick Start

### Prerequisites
- Docker and Docker Compose
- At least 4GB RAM available for containers

### Start All Services
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Individual Services
```bash
# Start only database services
docker-compose up -d redis supabase-db

# Start only API services
docker-compose up -d gateway worker

# Start only frontend services
docker-compose up -d dashboard mobile
```

## Services

### Core Infrastructure
- **Redis** (Port 6379) - Message queuing and caching
- **Supabase DB** (Port 5432) - PostgreSQL database
- **Supabase Studio** (Port 3000) - Database management UI
- **Supabase Meta** (Port 8080) - Database metadata API

### Applications
- **Gateway** (Port 8000) - FastAPI REST API
- **Worker** (Port 8001) - Python background worker
- **Dashboard** (Port 3001) - Next.js web dashboard
- **Mobile** (Port 3002) - React PWA mobile app

## Development

### Hot Reload
All services support hot reload for development:
```bash
# Start with hot reload
docker-compose up

# Rebuild specific service
docker-compose build gateway
docker-compose up -d gateway
```

### Database Management
Access Supabase Studio at http://localhost:3000
- Username: postgres
- Password: postgres
- Database: postgres

### API Documentation
Access API docs at http://localhost:8000/docs

## Production

### Build Production Images
```bash
# Build all images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Environment Variables
Set production environment variables:
```bash
# Copy example
cp .env.example .env.prod

# Edit with production values
nano .env.prod

# Use in compose
docker-compose --env-file .env.prod up -d
```

## Monitoring

### Health Checks
All services include health checks:
```bash
# Check service health
docker-compose ps

# View health check logs
docker inspect rfid-gateway | grep -A 10 Health
```

### Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs gateway
docker-compose logs worker

# Follow logs in real-time
docker-compose logs -f gateway worker
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using ports
   netstat -tulpn | grep :8000
   
   # Stop conflicting services
   sudo systemctl stop apache2  # example
   ```

2. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

3. **Out of Memory**
   ```bash
   # Increase Docker memory limit
   # Docker Desktop > Settings > Resources > Memory
   ```

4. **Database Connection Issues**
   ```bash
   # Check database health
   docker-compose exec supabase-db pg_isready -U postgres
   
   # Reset database
   docker-compose down -v
   docker-compose up -d supabase-db
   ```

### Reset Everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v --remove-orphans

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up -d
```

## Performance

### Resource Requirements
- **Minimum**: 4GB RAM, 2 CPU cores
- **Recommended**: 8GB RAM, 4 CPU cores
- **Production**: 16GB RAM, 8 CPU cores

### Optimization
```bash
# Use production images
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale worker=3

# Use external volumes for data persistence
docker volume create rfid_postgres_data
```

## Security

### Production Security
- Change default passwords
- Use secrets management
- Enable SSL/TLS
- Configure firewall rules
- Regular security updates

### Secrets Management
```bash
# Use Docker secrets
echo "your-secret-key" | docker secret create secret_key -
docker-compose -f docker-compose.secrets.yml up -d
```
