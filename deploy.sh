#!/bin/bash

# CareVault Deployment Script
# This script helps you deploy your app step by step

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 CareVault Deployment Helper${NC}\n"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js installed${NC}"

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found. Please install Git first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Git installed${NC}"

# Check if .env files exist
if [ ! -f "blockchain/.env" ]; then
    echo -e "${YELLOW}⚠️  blockchain/.env not found${NC}"
    echo "Creating template..."
    cat > blockchain/.env << EOF
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_wallet_private_key_here
EOF
    echo -e "${YELLOW}⚠️  Please edit blockchain/.env with your Infura key and private key${NC}"
fi

echo -e "\n${GREEN}Prerequisites check complete!${NC}\n"

# Step 1: Deploy Contract
echo -e "${YELLOW}Step 1: Deploy Smart Contract to Sepolia${NC}"
echo "This will deploy your contract to Sepolia testnet."
read -p "Do you have Infura API key and Sepolia ETH? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Checking blockchain/.env...${NC}"
    if grep -q "YOUR_INFURA_KEY" blockchain/.env || grep -q "your_wallet_private_key" blockchain/.env; then
        echo -e "${RED}❌ Please edit blockchain/.env with your actual Infura key and private key first!${NC}"
        echo "Edit: blockchain/.env"
        exit 1
    fi
    
    echo -e "${GREEN}Deploying contract...${NC}"
    cd blockchain
    source ../blockchain/.env 2>/dev/null || true
    npx hardhat run scripts/deploy.js --network sepolia
    cd ..
    
    echo -e "\n${GREEN}✅ Contract deployed!${NC}"
    echo -e "${YELLOW}⚠️  Copy the contract address above and save it!${NC}"
    read -p "Press Enter to continue..."
else
    echo -e "${YELLOW}Skipping contract deployment. You can do this later.${NC}"
fi

# Step 2: Check Git
echo -e "\n${YELLOW}Step 2: Prepare for GitHub${NC}"
if [ -d ".git" ]; then
    echo -e "${GREEN}✓ Git repository initialized${NC}"
    echo "Current status:"
    git status --short | head -5
else
    echo -e "${YELLOW}Initializing Git repository...${NC}"
    git init
    echo -e "${GREEN}✓ Git initialized${NC}"
fi

# Step 3: Build frontend
echo -e "\n${YELLOW}Step 3: Build Frontend${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
echo "Building frontend..."
npm run build
cd ..
echo -e "${GREEN}✓ Frontend built successfully${NC}"

# Step 4: Instructions
echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Preparation Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}\n"

echo "1. ${GREEN}Push to GitHub:${NC}"
echo "   git add ."
echo "   git commit -m 'Ready for deployment'"
echo "   git remote add origin https://github.com/YOUR_USERNAME/decentralized-health-records.git"
echo "   git push -u origin main\n"

echo "2. ${GREEN}Deploy Backend to Railway:${NC}"
echo "   - Go to https://railway.app"
echo "   - New Project → Deploy from GitHub"
echo "   - Select your repo"
echo "   - Set root directory: backend"
echo "   - Add environment variables (see README_DEPLOY.md)\n"

echo "3. ${GREEN}Deploy Frontend to Vercel:${NC}"
echo "   - Go to https://vercel.com"
echo "   - Import GitHub repo"
echo "   - Set root directory: frontend"
echo "   - Add environment variables (see README_DEPLOY.md)\n"

echo -e "${GREEN}For detailed instructions, see README_DEPLOY.md${NC}\n"

