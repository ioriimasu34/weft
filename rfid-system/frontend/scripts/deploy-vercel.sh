#!/bin/bash

# Vercel Deployment Script for StitchOS RFID Frontend
# This script automates the deployment process to Vercel

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="stitchos-rfid-frontend"
VERCEL_ORG_ID="your_org_id"
VERCEL_PROJECT_ID="your_project_id"

echo -e "${BLUE}🚀 Starting Vercel deployment for StitchOS RFID Frontend...${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI is not installed. Please install it first:${NC}"
    echo "npm i -g vercel"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Please run this script from the frontend directory${NC}"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci

# Build the application
echo -e "${YELLOW}🔨 Building the application...${NC}"
npm run build

# Check if build was successful
if [ ! -d ".next" ]; then
    echo -e "${RED}❌ Build failed. Please check the build output above.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully!${NC}"

# Deploy to Vercel
echo -e "${YELLOW}🚀 Deploying to Vercel...${NC}"

# Set environment variables for deployment
export VERCEL_ORG_ID=$VERCEL_ORG_ID
export VERCEL_PROJECT_ID=$VERCEL_PROJECT_ID

# Deploy with production settings
vercel --prod --yes

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"

# Get deployment URL
DEPLOYMENT_URL=$(vercel ls | grep "stitchos-rfid-frontend" | head -1 | awk '{print $2}')

if [ ! -z "$DEPLOYMENT_URL" ]; then
    echo -e "${GREEN}🌐 Your application is available at: ${DEPLOYMENT_URL}${NC}"
else
    echo -e "${YELLOW}⚠️  Please check Vercel dashboard for deployment URL${NC}"
fi

# Post-deployment checks
echo -e "${YELLOW}🔍 Running post-deployment checks...${NC}"

# Check if the app is responding
if [ ! -z "$DEPLOYMENT_URL" ]; then
    echo "Testing application response..."
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Application is responding correctly (HTTP $HTTP_STATUS)${NC}"
    else
        echo -e "${YELLOW}⚠️  Application returned HTTP $HTTP_STATUS${NC}"
    fi
fi

echo -e "${GREEN}🎯 Deployment process completed!${NC}"
echo -e "${BLUE}📚 Next steps:${NC}"
echo "1. Configure environment variables in Vercel dashboard"
echo "2. Set up custom domain if needed"
echo "3. Configure backend API endpoints"
echo "4. Test all functionality"
echo "5. Monitor performance and errors"