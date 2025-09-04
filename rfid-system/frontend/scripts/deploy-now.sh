#!/bin/bash

# 🚀 One-Command Deployment Script for StitchOS RFID Dashboard
# This script handles everything: setup, configuration, and deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo -e "${BLUE}🚀 StitchOS RFID - One-Command Deployment${NC}"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --api-url URL          Set backend API URL"
    echo "  --ws-url URL           Set WebSocket URL"
    echo "  --supabase-url URL     Set Supabase project URL"
    echo "  --supabase-key KEY     Set Supabase anonymous key"
    echo "  --interactive          Use interactive mode (default)"
    echo "  --auto                 Use automated mode (requires env vars)"
    echo "  --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --interactive"
    echo "  $0 --auto"
    echo "  $0 --api-url https://api.stitchos.com --supabase-url https://project.supabase.co"
    echo ""
    echo "Environment Variables (for --auto mode):"
    echo "  NEXT_PUBLIC_API_BASE_URL"
    echo "  NEXT_PUBLIC_WS_URL"
    echo "  NEXT_PUBLIC_SUPABASE_URL"
    echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  VERCEL_PROJECT_ID"
    echo "  VERCEL_ORG_ID"
}

# Parse command line arguments
INTERACTIVE=true
API_URL=""
WS_URL=""
SUPABASE_URL=""
SUPABASE_KEY=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --api-url)
            API_URL="$2"
            shift 2
            ;;
        --ws-url)
            WS_URL="$2"
            shift 2
            ;;
        --supabase-url)
            SUPABASE_URL="$2"
            shift 2
            ;;
        --supabase-key)
            SUPABASE_KEY="$2"
            shift 2
            ;;
        --interactive)
            INTERACTIVE=true
            shift
            ;;
        --auto)
            INTERACTIVE=false
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main deployment function
deploy() {
    echo -e "${BLUE}"
    echo "🚀 StitchOS RFID - One-Command Deployment"
    echo "========================================"
    echo -e "${NC}"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "Please run this script from the frontend directory!"
        exit 1
    fi
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm ci
    print_success "Dependencies installed!"
    
    # Run tests
    print_status "Running tests..."
    npm test -- --coverage --watchAll=false
    print_success "Tests passed!"
    
    # Build the application
    print_status "Building application..."
    npm run build
    print_success "Application built successfully!"
    
    # Install Vercel CLI if not present
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
        print_success "Vercel CLI installed!"
    fi
    
    # Check if user is logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        print_warning "Please log in to Vercel..."
        vercel login
    fi
    
    # Link to Vercel project if not already linked
    if [ ! -f ".vercel/project.json" ]; then
        print_status "Linking to Vercel project..."
        vercel link
    fi
    
    # Set environment variables
    if [ "$INTERACTIVE" = true ]; then
        print_status "Setting up environment variables (interactive mode)..."
        
        # Use provided values or ask for input
        if [ -z "$API_URL" ]; then
            read -p "Backend API URL (e.g., https://api.stitchos.com): " API_URL
        fi
        
        if [ -z "$WS_URL" ]; then
            read -p "WebSocket URL (e.g., wss://ws.stitchos.com): " WS_URL
        fi
        
        if [ -z "$SUPABASE_URL" ]; then
            read -p "Supabase URL (e.g., https://project.supabase.co): " SUPABASE_URL
        fi
        
        if [ -z "$SUPABASE_KEY" ]; then
            read -p "Supabase Anonymous Key: " SUPABASE_KEY
        fi
        
        # Set environment variables
        echo "StitchOS RFID" | vercel env add NEXT_PUBLIC_APP_NAME production
        echo "1.0.0" | vercel env add NEXT_PUBLIC_APP_VERSION production
        echo "production" | vercel env add NEXT_PUBLIC_APP_ENV production
        echo "$API_URL" | vercel env add NEXT_PUBLIC_API_BASE_URL production
        echo "$WS_URL" | vercel env add NEXT_PUBLIC_WS_URL production
        echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
        echo "$SUPABASE_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
        echo "true" | vercel env add NEXT_PUBLIC_ENABLE_ANALYTICS production
        echo "false" | vercel env add NEXT_PUBLIC_ENABLE_DEBUG production
        echo "true" | vercel env add NEXT_PUBLIC_ENABLE_PWA production
        
    else
        print_status "Setting up environment variables (automated mode)..."
        
        # Use environment variables
        API_URL=${NEXT_PUBLIC_API_BASE_URL:-"https://your-backend-domain.com"}
        WS_URL=${NEXT_PUBLIC_WS_URL:-"wss://your-backend-domain.com"}
        SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-"https://your-project.supabase.co"}
        SUPABASE_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-"your_actual_supabase_anon_key"}
        
        # Validate required environment variables
        if [ "$API_URL" = "https://your-backend-domain.com" ]; then
            print_error "NEXT_PUBLIC_API_BASE_URL must be set!"
            exit 1
        fi
        
        if [ "$WS_URL" = "wss://your-backend-domain.com" ]; then
            print_error "NEXT_PUBLIC_WS_URL must be set!"
            exit 1
        fi
        
        if [ "$SUPABASE_URL" = "https://your-project.supabase.co" ]; then
            print_error "NEXT_PUBLIC_SUPABASE_URL must be set!"
            exit 1
        fi
        
        if [ "$SUPABASE_KEY" = "your_actual_supabase_anon_key" ]; then
            print_error "NEXT_PUBLIC_SUPABASE_ANON_KEY must be set!"
            exit 1
        fi
        
        # Set environment variables
        echo "StitchOS RFID" | vercel env add NEXT_PUBLIC_APP_NAME production
        echo "1.0.0" | vercel env add NEXT_PUBLIC_APP_VERSION production
        echo "production" | vercel env add NEXT_PUBLIC_APP_ENV production
        echo "$API_URL" | vercel env add NEXT_PUBLIC_API_BASE_URL production
        echo "$WS_URL" | vercel env add NEXT_PUBLIC_WS_URL production
        echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
        echo "$SUPABASE_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
        echo "true" | vercel env add NEXT_PUBLIC_ENABLE_ANALYTICS production
        echo "false" | vercel env add NEXT_PUBLIC_ENABLE_DEBUG production
        echo "true" | vercel env add NEXT_PUBLIC_ENABLE_PWA production
    fi
    
    print_success "Environment variables configured!"
    
    # Deploy to Vercel
    print_status "Deploying to Vercel..."
    vercel --prod
    
    # Get deployment URL
    DEPLOYMENT_URL=$(vercel ls --limit 1 | tail -n 1 | awk '{print $2}')
    
    print_success "Deployment complete!"
    echo ""
    echo -e "${GREEN}🎉 Your StitchOS RFID Dashboard is now live!${NC}"
    echo ""
    echo "📱 **Deployment URL:** $DEPLOYMENT_URL"
    echo ""
    echo "🔧 **Environment Variables Configured:**"
    echo "   ✅ NEXT_PUBLIC_APP_NAME"
    echo "   ✅ NEXT_PUBLIC_API_BASE_URL"
    echo "   ✅ NEXT_PUBLIC_WS_URL"
    echo "   ✅ NEXT_PUBLIC_SUPABASE_URL"
    echo "   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo ""
    echo "📋 **Next Steps:**"
    echo "   1. Test your application at the deployment URL"
    echo "   2. Verify all features are working correctly"
    echo "   3. Check the browser console for any errors"
    echo "   4. Monitor your application performance"
    echo ""
    echo "🆘 **Need Help?**"
    echo "   - Check the documentation in the project"
    echo "   - Create an issue on GitHub"
    echo "   - Contact the development team"
    echo ""
    echo -e "${BLUE}Happy tracking with StitchOS RFID! 🚀${NC}"
}

# Run deployment
deploy