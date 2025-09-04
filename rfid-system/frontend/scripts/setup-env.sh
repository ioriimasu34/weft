#!/bin/bash

# 🚀 Automated Environment Variables Setup for Vercel
# This script automatically configures all required environment variables

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

# Function to check if Vercel CLI is installed
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is not installed!"
        print_status "Installing Vercel CLI..."
        npm install -g vercel
        print_success "Vercel CLI installed successfully!"
    else
        print_success "Vercel CLI is already installed"
    fi
}

# Function to check if user is logged in to Vercel
check_vercel_auth() {
    if ! vercel whoami &> /dev/null; then
        print_warning "Not logged in to Vercel. Please log in..."
        vercel login
        print_success "Successfully logged in to Vercel!"
    else
        print_success "Already logged in to Vercel"
    fi
}

# Function to get project information
get_project_info() {
    print_status "Getting project information..."
    
    # Check if we're in a Vercel project
    if [ ! -f ".vercel/project.json" ]; then
        print_warning "No Vercel project found. Linking to existing project or creating new one..."
        vercel link
    fi
    
    # Get project ID
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
    ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*"' | cut -d'"' -f4)
    
    print_success "Project ID: $PROJECT_ID"
    print_success "Organization ID: $ORG_ID"
}

# Function to set environment variables
set_environment_variables() {
    print_status "Setting up environment variables..."
    
    # Default values (can be overridden by environment variables or user input)
    APP_NAME=${NEXT_PUBLIC_APP_NAME:-"StitchOS RFID"}
    APP_VERSION=${NEXT_PUBLIC_APP_VERSION:-"1.0.0"}
    APP_ENV=${NEXT_PUBLIC_APP_ENV:-"production"}
    API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL:-"https://your-backend-domain.com"}
    WS_URL=${NEXT_PUBLIC_WS_URL:-"wss://your-backend-domain.com"}
    SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-"https://your-project.supabase.co"}
    SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-"your_actual_supabase_anon_key"}
    
    # Interactive setup if values are defaults
    if [ "$API_BASE_URL" = "https://your-backend-domain.com" ]; then
        echo -e "${YELLOW}Please provide your backend API URL:${NC}"
        read -p "API Base URL (e.g., https://api.stitchos.com): " API_BASE_URL
    fi
    
    if [ "$WS_URL" = "wss://your-backend-domain.com" ]; then
        echo -e "${YELLOW}Please provide your WebSocket URL:${NC}"
        read -p "WebSocket URL (e.g., wss://ws.stitchos.com): " WS_URL
    fi
    
    if [ "$SUPABASE_URL" = "https://your-project.supabase.co" ]; then
        echo -e "${YELLOW}Please provide your Supabase project URL:${NC}"
        read -p "Supabase URL (e.g., https://abcdefghijklmnop.supabase.co): " SUPABASE_URL
    fi
    
    if [ "$SUPABASE_ANON_KEY" = "your_actual_supabase_anon_key" ]; then
        echo -e "${YELLOW}Please provide your Supabase anonymous key:${NC}"
        read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
    fi
    
    # Set environment variables for production
    print_status "Setting production environment variables..."
    
    echo "$APP_NAME" | vercel env add NEXT_PUBLIC_APP_NAME production
    echo "$APP_VERSION" | vercel env add NEXT_PUBLIC_APP_VERSION production
    echo "$APP_ENV" | vercel env add NEXT_PUBLIC_APP_ENV production
    echo "$API_BASE_URL" | vercel env add NEXT_PUBLIC_API_BASE_URL production
    echo "$WS_URL" | vercel env add NEXT_PUBLIC_WS_URL production
    echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
    echo "$SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
    
    # Set optional variables
    echo "true" | vercel env add NEXT_PUBLIC_ENABLE_ANALYTICS production
    echo "false" | vercel env add NEXT_PUBLIC_ENABLE_DEBUG production
    echo "true" | vercel env add NEXT_PUBLIC_ENABLE_PWA production
    
    print_success "Production environment variables set successfully!"
    
    # Ask if user wants to set preview environment variables
    echo -e "${YELLOW}Do you want to set up preview environment variables? (y/n):${NC}"
    read -p "> " SET_PREVIEW
    
    if [ "$SET_PREVIEW" = "y" ] || [ "$SET_PREVIEW" = "Y" ]; then
        print_status "Setting preview environment variables..."
        
        echo "StitchOS RFID (Preview)" | vercel env add NEXT_PUBLIC_APP_NAME preview
        echo "$APP_VERSION" | vercel env add NEXT_PUBLIC_APP_VERSION preview
        echo "preview" | vercel env add NEXT_PUBLIC_APP_ENV preview
        echo "$API_BASE_URL" | vercel env add NEXT_PUBLIC_API_BASE_URL preview
        echo "$WS_URL" | vercel env add NEXT_PUBLIC_WS_URL preview
        echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL preview
        echo "$SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
        echo "false" | vercel env add NEXT_PUBLIC_ENABLE_ANALYTICS preview
        echo "true" | vercel env add NEXT_PUBLIC_ENABLE_DEBUG preview
        echo "false" | vercel env add NEXT_PUBLIC_ENABLE_PWA preview
        
        print_success "Preview environment variables set successfully!"
    fi
}

# Function to verify environment variables
verify_environment_variables() {
    print_status "Verifying environment variables..."
    
    # List all environment variables
    vercel env ls
    
    print_success "Environment variables verification complete!"
}

# Function to deploy the application
deploy_application() {
    print_status "Deploying application to Vercel..."
    
    # Deploy to production
    vercel --prod
    
    print_success "Application deployed successfully!"
}

# Function to show deployment URL
show_deployment_info() {
    print_status "Getting deployment information..."
    
    # Get the latest deployment URL
    DEPLOYMENT_URL=$(vercel ls --limit 1 | tail -n 1 | awk '{print $2}')
    
    print_success "Deployment URL: $DEPLOYMENT_URL"
    print_status "You can now access your StitchOS RFID Dashboard at: $DEPLOYMENT_URL"
}

# Main function
main() {
    echo -e "${BLUE}"
    echo "🚀 StitchOS RFID - Automated Environment Setup"
    echo "=============================================="
    echo -e "${NC}"
    
    # Check prerequisites
    check_vercel_cli
    check_vercel_auth
    
    # Get project information
    get_project_info
    
    # Set environment variables
    set_environment_variables
    
    # Verify environment variables
    verify_environment_variables
    
    # Deploy application
    deploy_application
    
    # Show deployment information
    show_deployment_info
    
    echo -e "${GREEN}"
    echo "🎉 Setup Complete!"
    echo "=================="
    echo -e "${NC}"
    echo "Your StitchOS RFID Dashboard has been deployed with all environment variables configured!"
    echo ""
    echo "Next steps:"
    echo "1. Test your application at the deployment URL"
    echo "2. Verify all features are working correctly"
    echo "3. Check the browser console for any errors"
    echo "4. Monitor your application performance"
    echo ""
    echo "For support, check the documentation or create an issue on GitHub."
}

# Run main function
main "$@"