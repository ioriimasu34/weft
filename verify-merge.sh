#!/bin/bash

# RFID Platform - Merge Verification Script
# Run this after completing the git merge to verify everything is correct

echo "🔍 RFID Platform Merge Verification"
echo "==================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1 exists"
        return 0
    else
        echo -e "${RED}❌${NC} $1 missing"
        return 1
    fi
}

check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $1 exists"
        return 0
    else
        echo -e "${RED}❌${NC} $1 missing"
        return 1
    fi
}

echo -e "${BLUE}Checking RFID Platform Structure...${NC}"

# Check main directories
check_directory "rfid-platform"
check_directory "rfid-platform/apps"
check_directory "rfid-platform/apps/dashboard"
check_directory "rfid-platform/apps/gateway"
check_directory "rfid-platform/apps/ingest-worker"
check_directory "rfid-platform/apps/mobile"
check_directory "rfid-platform/infra"
check_directory "rfid-platform/infra/supabase"
check_directory "rfid-platform/docs"
check_directory "rfid-platform/scripts"
check_directory "rfid-platform/.github"

# Check old system is removed
if [ ! -d "rfid-system" ]; then
    echo -e "${GREEN}✅${NC} Old rfid-system directory removed"
else
    echo -e "${RED}❌${NC} Old rfid-system directory still exists"
fi

# Check root files
echo -e "${BLUE}Checking Root Files...${NC}"
check_file "README.md"
check_file "package.json"
check_file ".gitignore"
check_file "Makefile"
check_file "CHANGELOG.md"
check_file "MERGE-SUMMARY.md"
check_file "GIT-MERGE-INSTRUCTIONS.md"

# Check key platform files
echo -e "${BLUE}Checking Platform Files...${NC}"
check_file "rfid-platform/README.md"
check_file "rfid-platform/package.json"
check_file "rfid-platform/apps/dashboard/package.json"
check_file "rfid-platform/apps/gateway/requirements.txt"
check_file "rfid-platform/apps/ingest-worker/requirements.txt"
check_file "rfid-platform/infra/supabase/migrations/001_initial_schema.sql"
check_file "rfid-platform/infra/supabase/seed.sql"

# Check CI/CD
echo -e "${BLUE}Checking CI/CD...${NC}"
check_file "rfid-platform/.github/workflows/check.yml"
check_file "rfid-platform/.github/workflows/e2e.yml"
check_file "rfid-platform/.github/workflows/deploy.yml"

# Check documentation
echo -e "${BLUE}Checking Documentation...${NC}"
check_file "rfid-platform/docs/DEPLOY.md"

echo ""
echo -e "${BLUE}Git Status Check...${NC}"
if command -v git &> /dev/null; then
    echo "Current branch: $(git branch --show-current)"
    echo "Git status:"
    git status --porcelain
    echo ""
    echo "Recent commits:"
    git log --oneline -3
else
    echo -e "${YELLOW}⚠️${NC} Git not available for status check"
fi

echo ""
echo -e "${BLUE}Verification Complete!${NC}"
echo "================================"
echo ""
echo "If all items show ✅, your merge was successful!"
echo "If any items show ❌, please check the GIT-MERGE-INSTRUCTIONS.md file"
echo ""
echo "Next steps:"
echo "1. Run: npm run setup"
echo "2. Run: npm run dev"
echo "3. Run: npm run test"
echo "4. Run: npm run deploy"
echo ""
echo "Happy coding! 🚀"