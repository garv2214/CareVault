#!/bin/bash

# CareVault Startup Script
# This script starts all services needed for the application

echo "🏥 Starting CareVault..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  backend/.env not found. Copying from .env.example...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠️  Please edit backend/.env with your contract address!${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠️  frontend/.env not found. Copying from .env.example...${NC}"
    cp frontend/.env.example frontend/.env
    echo -e "${YELLOW}⚠️  Please edit frontend/.env with your contract address!${NC}"
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Check ports
if check_port 8545; then
    echo -e "${GREEN}✓ Blockchain node already running on port 8545${NC}"
else
    echo -e "${YELLOW}⚠️  Blockchain node not running. Please start it with:${NC}"
    echo "   cd blockchain && npx hardhat node"
    echo ""
fi

if check_port 8000; then
    echo -e "${GREEN}✓ AI service already running on port 8000${NC}"
else
    echo -e "${YELLOW}Starting AI service...${NC}"
    cd ai
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    source venv/bin/activate
    pip install -q -r requirements.txt
    python ai_server.py &
    cd ..
    sleep 2
fi

if check_port 5000; then
    echo -e "${GREEN}✓ Backend already running on port 5000${NC}"
else
    echo -e "${YELLOW}Starting backend...${NC}"
    cd backend
    npm install -q
    node index.js &
    cd ..
    sleep 2
fi

if check_port 3000; then
    echo -e "${GREEN}✓ Frontend already running on port 3000${NC}"
else
    echo -e "${YELLOW}Starting frontend...${NC}"
    cd frontend
    npm install -q
    npm start &
    cd ..
fi

echo ""
echo -e "${GREEN}✅ All services starting!${NC}"
echo ""
echo "📋 Services:"
echo "   - Blockchain: http://localhost:8545"
echo "   - AI Service: http://localhost:8000"
echo "   - Backend: http://localhost:5000"
echo "   - Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
wait

