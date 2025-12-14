#!/bin/bash

# Quick CLI Deployment Script
# Run: ./CLI_DEPLOY.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🚀 CareVault CLI Deployment${NC}\n"

# Step 1: Build Frontend
echo -e "${YELLOW}[1/4] Building frontend...${NC}"
cd frontend
npm run build
cd ..
echo -e "${GREEN}✅ Frontend built${NC}\n"

# Step 2: Check Vercel
echo -e "${YELLOW}[2/4] Checking Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Installing Vercel CLI...${NC}"
    npm install -g vercel
fi
echo -e "${GREEN}✅ Vercel CLI ready${NC}\n"

# Step 3: Deploy Frontend
echo -e "${YELLOW}[3/4] Deploying frontend to Vercel...${NC}"
echo -e "${BLUE}Note: You'll need to:${NC}"
echo "  1. Login to Vercel (if not logged in)"
echo "  2. Set environment variables in Vercel dashboard:"
echo "     - REACT_APP_API_URL"
echo "     - REACT_APP_CONTRACT_ADDRESS"
echo ""
read -p "Ready to deploy frontend? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd frontend
    vercel --prod
    cd ..
    echo -e "${GREEN}✅ Frontend deployed!${NC}\n"
else
    echo -e "${YELLOW}Skipping frontend deployment${NC}\n"
fi

# Step 4: Instructions for Backend
echo -e "${YELLOW}[4/4] Backend Deployment${NC}"
echo -e "${BLUE}To deploy backend to Railway:${NC}"
echo "  1. Go to https://railway.app"
echo "  2. New Project → Deploy from GitHub"
echo "  3. Select your repo"
echo "  4. Set root directory: backend"
echo "  5. Add environment variables"
echo "  6. Deploy!"
echo ""

echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment process complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"

