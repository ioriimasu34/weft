# StitchOS RFID Tracking System Makefile

.PHONY: help install build test run clean deploy logs status

# Default target
help:
	@echo "🏭 StitchOS RFID Tracking System"
	@echo "=================================="
	@echo ""
	@echo "Available commands:"
	@echo "  install     - Install all dependencies"
	@echo "  build       - Build all components"
	@echo "  test        - Run tests"
	@echo "  run         - Start all services"
	@echo "  stop        - Stop all services"
	@echo "  clean       - Clean build artifacts"
	@echo "  deploy      - Deploy to production"
	@echo "  logs        - View service logs"
	@echo "  status      - Check service status"
	@echo "  simulate    - Run RFID data simulation"
	@echo "  db-setup    - Setup database and run migrations"
	@echo "  db-reset    - Reset database (development only)"
	@echo ""

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	
	# Backend Python dependencies
	@echo "Installing Python dependencies..."
	cd backend && python -m venv venv
	cd backend && source venv/bin/activate && pip install -r requirements.txt
	
	# Frontend Node.js dependencies
	@echo "Installing Node.js dependencies..."
	cd frontend && npm install
	
	# Mobile Flutter dependencies
	@echo "Installing Flutter dependencies..."
	cd mobile && flutter pub get
	
	@echo "✅ Dependencies installed successfully!"

# Build all components
build:
	@echo "🔨 Building all components..."
	
	# Build backend
	@echo "Building backend services..."
	cd backend && source venv/bin/activate && python -m py_compile shared/*.py services/*.py
	
	# Build frontend
	@echo "Building frontend..."
	cd frontend && npm run build
	
	# Build mobile app
	@echo "Building mobile app..."
	cd mobile && flutter build apk --release
	
	@echo "✅ Build completed successfully!"

# Run tests
test:
	@echo "🧪 Running tests..."
	
	# Backend tests
	@echo "Running backend tests..."
	cd backend && source venv/bin/activate && python -m pytest tests/ -v
	
	# Frontend tests
	@echo "Running frontend tests..."
	cd frontend && npm test
	
	# Mobile tests
	@echo "Running mobile tests..."
	cd mobile && flutter test
	
	@echo "✅ Tests completed!"

# Start all services
run:
	@echo "🚀 Starting all services..."
	
	# Start infrastructure
	@echo "Starting infrastructure services..."
	cd infrastructure && docker-compose up -d
	
	# Wait for services to be ready
	@echo "Waiting for services to be ready..."
	sleep 10
	
	# Start backend services
	@echo "Starting backend services..."
	cd backend && source venv/bin/activate && \
		uvicorn rfid_ingest.main:app --reload --port 8001 --host 0.0.0.0 &
	cd backend && source venv/bin/activate && \
		uvicorn core_api.main:app --reload --port 8002 --host 0.0.0.0 &
	cd backend && source venv/bin/activate && \
		uvicorn realtime.main:app --reload --port 8003 --host 0.0.0.0 &
	
	# Start frontend
	@echo "Starting frontend..."
	cd frontend && npm run dev &
	
	@echo "✅ All services started!"
	@echo "📱 Frontend: http://localhost:3000"
	@echo "🔌 RFID Ingest API: http://localhost:8001"
	@echo "🌐 Core API: http://localhost:8002"
	@echo "📡 Real-time API: http://localhost:8003"
	@echo "🗄️  Database: localhost:5432"
	@echo "📊 Grafana: http://localhost:3000"

# Stop all services
stop:
	@echo "🛑 Stopping all services..."
	
	# Stop backend services
	pkill -f "uvicorn.*rfid_ingest" || true
	pkill -f "uvicorn.*core_api" || true
	pkill -f "uvicorn.*realtime" || true
	
	# Stop frontend
	pkill -f "next dev" || true
	
	# Stop infrastructure
	cd infrastructure && docker-compose down
	
	@echo "✅ All services stopped!"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	
	# Clean Python
	cd backend && find . -type f -name "*.pyc" -delete
	cd backend && find . -type d -name "__pycache__" -delete
	cd backend && rm -rf venv
	
	# Clean Node.js
	cd frontend && rm -rf .next node_modules
	cd frontend && rm -rf dist build
	
	# Clean Flutter
	cd mobile && flutter clean
	
	# Clean Docker
	docker system prune -f
	
	@echo "✅ Clean completed!"

# Deploy to production
deploy:
	@echo "🚀 Deploying to production..."
	
	# Build production images
	docker-compose -f infrastructure/docker-compose.prod.yml build
	
	# Deploy to production
	docker-compose -f infrastructure/docker-compose.prod.yml up -d
	
	@echo "✅ Production deployment completed!"

# View service logs
logs:
	@echo "📋 Service logs..."
	
	# Infrastructure logs
	@echo "=== Infrastructure Logs ==="
	cd infrastructure && docker-compose logs -f

# Check service status
status:
	@echo "📊 Service status..."
	
	# Check infrastructure
	@echo "=== Infrastructure Status ==="
	cd infrastructure && docker-compose ps
	
	# Check backend services
	@echo "=== Backend Services Status ==="
	curl -s http://localhost:8001/health || echo "❌ RFID Ingest Service: Not running"
	curl -s http://localhost:8002/health || echo "❌ Core API Service: Not running"
	curl -s http://localhost:8003/health || echo "❌ Real-time Service: Not running"
	
	# Check frontend
	@echo "=== Frontend Status ==="
	curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend: Running" || echo "❌ Frontend: Not running"

# Run RFID data simulation
simulate:
	@echo "🎲 Running RFID data simulation..."
	cd tools && python simulate_rfid_data.py --duration 10 --scenario comprehensive

# Database setup and migrations
db-setup:
	@echo "🗄️ Setting up database..."
	
	# Start database services
	cd infrastructure && docker-compose up -d postgres redis
	
	# Wait for database to be ready
	@echo "Waiting for database to be ready..."
	sleep 15
	
	# Run migrations
	@echo "Running database migrations..."
	cd infrastructure && docker-compose exec postgres psql -U rfid_user -d rfid_tracking -f /docker-entrypoint-initdb.d/001_initial_schema.sql
	cd infrastructure && docker-compose exec postgres psql -U rfid_user -d rfid_tracking -f /docker-entrypoint-initdb.d/002_rls_policies.sql
	
	@echo "✅ Database setup completed!"

# Reset database (development only)
db-reset:
	@echo "⚠️  Resetting database (development only)..."
	
	# Stop services
	cd infrastructure && docker-compose down
	
	# Remove volumes
	docker volume rm rfid-system_postgres_data || true
	docker volume rm rfid-system_redis_data || true
	
	# Restart and setup
	cd infrastructure && docker-compose up -d postgres redis
	sleep 15
	$(MAKE) db-setup
	
	@echo "✅ Database reset completed!"

# Development setup
dev-setup: install db-setup
	@echo "✅ Development environment setup completed!"
	@echo ""
	@echo "Next steps:"
	@echo "1. Copy .env.example to .env and configure environment variables"
	@echo "2. Run 'make run' to start all services"
	@echo "3. Run 'make simulate' to test with sample data"

# Production setup
prod-setup:
	@echo "🚀 Setting up production environment..."
	
	# Create production environment file
	cp .env.example .env.prod
	
	# Build production images
	docker-compose -f infrastructure/docker-compose.prod.yml build
	
	@echo "✅ Production environment setup completed!"
	@echo "Edit .env.prod with your production configuration"
	@echo "Run 'make deploy' to deploy to production"

# Backup database
backup:
	@echo "💾 Creating database backup..."
	
	cd infrastructure && docker-compose exec postgres pg_dump -U rfid_user rfid_tracking > backup_$(date +%Y%m%d_%H%M%S).sql
	
	@echo "✅ Database backup completed!"

# Restore database
restore:
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "❌ Please specify backup file: make restore BACKUP_FILE=backup_20231201_120000.sql"; \
		exit 1; \
	fi
	
	@echo "🔄 Restoring database from $(BACKUP_FILE)..."
	
	cd infrastructure && docker-compose exec -T postgres psql -U rfid_user -d rfid_tracking < $(BACKUP_FILE)
	
	@echo "✅ Database restore completed!"

# Monitor system resources
monitor:
	@echo "📊 System resource monitoring..."
	
	@echo "=== Docker Resources ==="
	docker stats --no-stream
	
	@echo "=== System Resources ==="
	free -h
	df -h
	top -bn1 | head -20

# Security audit
security-audit:
	@echo "🔒 Running security audit..."
	
	# Check for security vulnerabilities in dependencies
	cd backend && source venv/bin/activate && safety check
	cd frontend && npm audit
	
	# Check Docker images for vulnerabilities
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
		goodwithtech/dockle --exit-code 1 \
		$(docker images -q rfid-system_*)
	
	@echo "✅ Security audit completed!"

# Performance test
perf-test:
	@echo "⚡ Running performance tests..."
	
	# Run load testing
	cd tools && python load_test.py --users 100 --duration 60
	
	@echo "✅ Performance tests completed!"

# Update dependencies
update-deps:
	@echo "🔄 Updating dependencies..."
	
	# Update Python dependencies
	cd backend && source venv/bin/activate && pip install --upgrade pip
	cd backend && source venv/bin/activate && pip install --upgrade -r requirements.txt
	
	# Update Node.js dependencies
	cd frontend && npm update
	
	# Update Flutter dependencies
	cd mobile && flutter pub upgrade
	
	@echo "✅ Dependencies updated!"

# Show help for specific target
help-%:
	@echo "Help for target '$*':"
	@grep -A 1 "^$*:" Makefile | tail -1 | sed 's/^[[:space:]]*//'