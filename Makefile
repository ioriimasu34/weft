# RFID Platform - Production Software
# Enterprise-grade RFID tracking system for textile & apparel factories

.PHONY: help setup dev build test deploy clean install lint format

# Default target
help: ## Show this help message
	@echo "🏭 RFID Platform - Production Software"
	@echo "======================================"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Setup and Installation
setup: ## Setup development environment
	@echo "🚀 Setting up RFID Platform..."
	npm run setup

install: ## Install all dependencies
	@echo "📦 Installing dependencies..."
	npm install
	cd rfid-platform/apps/dashboard && npm install
	cd rfid-platform/apps/gateway && pip install -r requirements.txt
	cd rfid-platform/apps/ingest-worker && pip install -r requirements.txt

# Development
dev: ## Start development servers
	@echo "🔧 Starting development servers..."
	npm run dev

dev-dashboard: ## Start dashboard only
	@echo "🎨 Starting dashboard..."
	cd rfid-platform/apps/dashboard && npm run dev

dev-gateway: ## Start gateway only
	@echo "🚪 Starting gateway..."
	cd rfid-platform/apps/gateway && python main.py

dev-worker: ## Start worker only
	@echo "⚙️ Starting worker..."
	cd rfid-platform/apps/ingest-worker && python main.py

# Building
build: ## Build all applications
	@echo "🏗️ Building applications..."
	npm run build

build-dashboard: ## Build dashboard
	@echo "🎨 Building dashboard..."
	cd rfid-platform/apps/dashboard && npm run build

build-gateway: ## Build gateway
	@echo "🚪 Building gateway..."
	cd rfid-platform/apps/gateway && python -m py_compile main.py

build-worker: ## Build worker
	@echo "⚙️ Building worker..."
	cd rfid-platform/apps/ingest-worker && python -m py_compile main.py

# Testing
test: ## Run all tests
	@echo "🧪 Running tests..."
	npm run test

test-unit: ## Run unit tests
	@echo "🧪 Running unit tests..."
	cd rfid-platform/apps/dashboard && npm run test
	cd rfid-platform/apps/gateway && pytest
	cd rfid-platform/apps/ingest-worker && pytest

test-e2e: ## Run E2E tests
	@echo "🧪 Running E2E tests..."
	npm run e2e

test-integration: ## Run integration tests
	@echo "🧪 Running integration tests..."
	npm run test:integration

# Code Quality
lint: ## Run linting
	@echo "🧹 Running linting..."
	npm run lint

lint-fix: ## Fix linting issues
	@echo "🧹 Fixing linting issues..."
	cd rfid-platform/apps/dashboard && npm run lint -- --fix
	cd rfid-platform/apps/gateway && black . && flake8 .
	cd rfid-platform/apps/ingest-worker && black . && flake8 .

format: ## Format code
	@echo "🎨 Formatting code..."
	cd rfid-platform/apps/dashboard && npm run format
	cd rfid-platform/apps/gateway && black .
	cd rfid-platform/apps/ingest-worker && black .

typecheck: ## Run type checking
	@echo "🔍 Running type checking..."
	npm run typecheck

# Database
db-setup: ## Setup database
	@echo "🗄️ Setting up database..."
	cd rfid-platform && supabase start
	cd rfid-platform && supabase db reset --local

db-migrate: ## Run database migrations
	@echo "🗄️ Running migrations..."
	cd rfid-platform && supabase db push

db-seed: ## Seed database
	@echo "🌱 Seeding database..."
	cd rfid-platform && supabase db seed --local

db-reset: ## Reset database
	@echo "🗄️ Resetting database..."
	cd rfid-platform && supabase db reset --local

# Deployment
deploy: ## Deploy to production
	@echo "🚀 Deploying to production..."
	npm run deploy

deploy-dashboard: ## Deploy dashboard
	@echo "🎨 Deploying dashboard..."
	npm run deploy:dashboard

deploy-gateway: ## Deploy gateway
	@echo "🚪 Deploying gateway..."
	npm run deploy:gateway

deploy-worker: ## Deploy worker
	@echo "⚙️ Deploying worker..."
	npm run deploy:worker

deploy-mobile: ## Deploy mobile app
	@echo "📱 Deploying mobile app..."
	npm run deploy:mobile

# Monitoring and Observability
logs: ## View logs
	@echo "📊 Viewing logs..."
	cd rfid-platform/apps/gateway && flyctl logs -a rfid-gateway
	cd rfid-platform/apps/ingest-worker && flyctl logs -a rfid-worker

metrics: ## View metrics
	@echo "📊 Viewing metrics..."
	@echo "Dashboard: https://your-dashboard.vercel.app"
	@echo "Gateway: https://your-gateway.fly.dev/v1/metrics"

health: ## Check health
	@echo "🏥 Checking health..."
	curl -f https://your-gateway.fly.dev/v1/health || echo "Gateway not available"

# Security
security-scan: ## Run security scan
	@echo "🔒 Running security scan..."
	cd rfid-platform && npm audit
	cd rfid-platform/apps/gateway && safety check
	cd rfid-platform/apps/ingest-worker && safety check

# Performance
load-test: ## Run load tests
	@echo "📊 Running load tests..."
	npm run load-test

performance-test: ## Run performance tests
	@echo "⚡ Running performance tests..."
	cd rfid-platform/apps/dashboard && npm run e2e

# Cleanup
clean: ## Clean build artifacts
	@echo "🧹 Cleaning build artifacts..."
	npm run clean
	cd rfid-platform/apps/dashboard && rm -rf .next out dist
	cd rfid-platform/apps/gateway && find . -type d -name __pycache__ -delete
	cd rfid-platform/apps/ingest-worker && find . -type d -name __pycache__ -delete

clean-all: ## Clean everything
	@echo "🧹 Cleaning everything..."
	rm -rf node_modules
	rm -rf rfid-platform/apps/*/node_modules
	rm -rf rfid-platform/apps/*/__pycache__
	rm -rf rfid-platform/apps/*/.next
	rm -rf rfid-platform/apps/*/dist
	rm -rf rfid-platform/apps/*/out
	rm -rf .cache
	rm -rf .parcel-cache

# Documentation
docs: ## Generate documentation
	@echo "📚 Generating documentation..."
	@echo "Documentation is available in the docs/ directory"

docs-serve: ## Serve documentation
	@echo "📚 Serving documentation..."
	cd docs && python -m http.server 8000

# Utilities
check: ## Check everything
	@echo "🔍 Checking everything..."
	npm run verify

verify: ## Verify installation
	@echo "✅ Verifying installation..."
	node --version
	npm --version
	python3 --version
	docker --version

status: ## Show status
	@echo "📊 System Status:"
	@echo "================="
	@echo "Node.js: $$(node --version)"
	@echo "npm: $$(npm --version)"
	@echo "Python: $$(python3 --version)"
	@echo "Docker: $$(docker --version 2>/dev/null || echo 'Not installed')"
	@echo "Supabase: $$(npx supabase --version 2>/dev/null || echo 'Not installed')"

# Docker
docker-build: ## Build Docker images
	@echo "🐳 Building Docker images..."
	cd rfid-platform/infra/docker && docker-compose build

docker-up: ## Start Docker services
	@echo "🐳 Starting Docker services..."
	cd rfid-platform/infra/docker && docker-compose up -d

docker-down: ## Stop Docker services
	@echo "🐳 Stopping Docker services..."
	cd rfid-platform/infra/docker && docker-compose down

docker-logs: ## View Docker logs
	@echo "🐳 Viewing Docker logs..."
	cd rfid-platform/infra/docker && docker-compose logs -f

# CI/CD
ci: ## Run CI pipeline
	@echo "🔄 Running CI pipeline..."
	npm run typecheck
	npm run lint
	npm run test
	npm run build

# Production
prod-start: ## Start production services
	@echo "🚀 Starting production services..."
	npm run start

prod-stop: ## Stop production services
	@echo "🛑 Stopping production services..."
	pkill -f "node.*dashboard" || true
	pkill -f "python.*gateway" || true
	pkill -f "python.*worker" || true

# Backup and Restore
backup: ## Backup data
	@echo "💾 Creating backup..."
	cd rfid-platform && supabase db dump --local > backup-$(shell date +%Y%m%d-%H%M%S).sql

restore: ## Restore data
	@echo "🔄 Restoring data..."
	@echo "Usage: make restore BACKUP_FILE=backup-20231201-120000.sql"
	cd rfid-platform && supabase db reset --local && psql -f $(BACKUP_FILE)

# Development Tools
shell-dashboard: ## Open dashboard shell
	@echo "🐚 Opening dashboard shell..."
	cd rfid-platform/apps/dashboard && bash

shell-gateway: ## Open gateway shell
	@echo "🐚 Opening gateway shell..."
	cd rfid-platform/apps/gateway && bash

shell-worker: ## Open worker shell
	@echo "🐚 Opening worker shell..."
	cd rfid-platform/apps/ingest-worker && bash

# Quick Commands
quick-start: setup dev ## Quick start (setup + dev)
quick-test: lint test ## Quick test (lint + test)
quick-deploy: build deploy ## Quick deploy (build + deploy)

# Help for specific targets
help-setup: ## Show setup help
	@echo "Setup Commands:"
	@echo "  make setup     - Complete setup"
	@echo "  make install   - Install dependencies"
	@echo "  make db-setup  - Setup database"

help-dev: ## Show development help
	@echo "Development Commands:"
	@echo "  make dev           - Start all services"
	@echo "  make dev-dashboard - Start dashboard only"
	@echo "  make dev-gateway   - Start gateway only"
	@echo "  make dev-worker    - Start worker only"

help-deploy: ## Show deployment help
	@echo "Deployment Commands:"
	@echo "  make deploy           - Deploy all services"
	@echo "  make deploy-dashboard - Deploy dashboard"
	@echo "  make deploy-gateway   - Deploy gateway"
	@echo "  make deploy-worker    - Deploy worker"