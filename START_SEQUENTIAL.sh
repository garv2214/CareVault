#!/bin/bash

# CareVault Sequential Startup Script
# Starts services one by one with proper health checks

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BLOCKCHAIN_PORT=8545
BACKEND_PORT=7000
AI_PORT=8000
FRONTEND_PORT=3000

echo -e "${BLUE}🏥 =============================================${NC}"
echo -e "${BLUE}🏥           CAREVAULT STARTUP SCRIPT          ${NC}"
echo -e "${BLUE}🏥 =============================================${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}⚠️  Port $port is already in use${NC}"
        echo -e "${YELLOW}Please kill the process using this port or restart your computer${NC}"
        return 1
    fi
    return 0
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}⏳ Waiting for $service_name to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name failed to start${NC}"
    return 1
}

# Check prerequisites
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi

# Check if Node.js version is compatible
node_version=$(node -v | cut -d'v' -f2)
required_version="16.0.0"
if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo -e "${RED}❌ Node.js version $node_version is too old. Requires v16+${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
if ! npm run install:all >/dev/null 2>&1; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Install Python dependencies
if [ ! -d "ai/venv" ]; then
    echo -e "${YELLOW}🐍 Setting up Python virtual environment...${NC}"
    cd ai
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Check ports
echo -e "${YELLOW}🔍 Checking port availability...${NC}"
check_port $BLOCKCHAIN_PORT || exit 1
check_port $BACKEND_PORT || exit 1
check_port $AI_PORT || exit 1
check_port $FRONTEND_PORT || exit 1
echo -e "${GREEN}✅ All ports available${NC}"
echo ""

# Kill any existing processes
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
pkill -f "hardhat node" 2>/dev/null || true
pkill -f "node.*index.js" 2>/dev/null || true
pkill -f "python.*ai_server.py" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true
sleep 2

# Step 1: Start Blockchain
echo -e "${BLUE}⛓️  Starting Blockchain Network...${NC}"
cd blockchain
npx hardhat node > ../logs/blockchain.log 2>&1 &
BLOCKCHAIN_PID=$!
cd ..

# Wait for blockchain to start
sleep 5
if ! ps -p $BLOCKCHAIN_PID > /dev/null; then
    echo -e "${RED}❌ Blockchain failed to start${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Blockchain started (PID: $BLOCKCHAIN_PID)${NC}"

# Step 2: Deploy Contract
echo -e "${YELLOW}📜 Deploying Smart Contract...${NC}"
sleep 3
cd blockchain
DEPLOY_OUTPUT=$(npx hardhat run scripts/deploy.js --network localhost 2>&1)
cd ..

# Extract contract address
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -o '0x[a-fA-F0-9]\{40\}' | head -1)
if [ -z "$CONTRACT_ADDRESS" ]; then
    echo -e "${RED}❌ Failed to extract contract address${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contract deployed at: $CONTRACT_ADDRESS${NC}"

# Step 3: Start AI Service
echo -e "${BLUE}🤖 Starting AI Service...${NC}"
cd ai
source venv/bin/activate
python ai_server.py > ../logs/ai.log 2>&1 &
AI_PID=$!
cd ..

if ! wait_for_service "http://localhost:$AI_PORT" "AI Service"; then
    echo -e "${RED}❌ AI Service startup failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AI Service started (PID: $AI_PID)${NC}"

# Step 4: Start Backend
echo -e "${BLUE}🔧 Starting Backend Server...${NC}"
cd backend
node index.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

if ! wait_for_service "http://localhost:$BACKEND_PORT" "Backend Server"; then
    echo -e "${RED}❌ Backend startup failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"

# Step 5: Start Frontend
echo -e "${BLUE}🌐 Starting Frontend Application...${NC}"
cd frontend
npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

if ! wait_for_service "http://localhost:$FRONTEND_PORT" "Frontend Application"; then
    echo -e "${RED}❌ Frontend startup failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"

# Save PIDs for cleanup
echo "$BLOCKCHAIN_PID $AI_PID $BACKEND_PID $FRONTEND_PID" > .carevault_pids

echo ""
echo -e "${GREEN}🎉 ============================================${NC}"
echo -e "${GREEN}🎉       CAREVAULT STARTUP COMPLETE!          ${NC}"
echo -e "${GREEN}🎉 ============================================${NC}"
echo ""
echo -e "${BLUE}🌐 Open http://localhost:3000 in your browser${NC}"
echo -e "${BLUE}🎯 CareVault is now ready for your presentation!${NC}"
echo ""
echo -e "${YELLOW}📋 Service Status:${NC}"
echo -e "   🔗 Blockchain: http://localhost:$BLOCKCHAIN_PORT"
echo -e "   🔧 Backend:    http://localhost:$BACKEND_PORT"
echo -e "   🤖 AI Service: http://localhost:$AI_PORT"
echo -e "   🌐 Frontend:   http://localhost:$FRONTEND_PORT"
echo ""
echo -e "${YELLOW}💡 To stop all services, run: ./stop_carevault.sh${NC}"

# Keep script running to show logs
echo -e "${BLUE}📊 Monitoring services... (Press Ctrl+C to stop)${NC}"
echo ""
tail -f logs/*.log 2>/dev/null || echo -e "${YELLOW}No logs available yet${NC}"
