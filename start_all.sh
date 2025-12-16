#!/bin/bash

# CareVault - Single Command Startup Script for macOS M1
# Usage: ./start_all.sh
# This script starts all required services for the CareVault application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${PURPLE}🏥 =============================================${NC}"
    echo -e "${PURPLE}🏥           CAREVAULT STARTUP SCRIPT          ${NC}"
    echo -e "${PURPLE}🏥 =============================================${NC}"
    echo ""
}

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

print_header() {
    echo -e "${PURPLE}🏥 =============================================${NC}"
    echo -e "${PURPLE}🏥           CAREVAULT STARTUP SCRIPT          ${NC}"
    echo -e "${PURPLE}🏥 =============================================${NC}"
    echo ""
}

print_header

# Detect system architecture
ARCH=$(uname -m)
print_status "Detected architecture: $ARCH"

if [[ "$ARCH" == "arm64" ]]; then
    print_success "✅ Apple Silicon detected (M1/M2) - Optimizing for macOS"
    PLATFORM="apple-silicon"
elif [[ "$ARCH" == "x86_64" ]]; then
    print_warning "⚠️ Intel Mac detected - Running with standard compatibility"
    PLATFORM="intel"
else
    print_warning "⚠️ Unknown architecture: $ARCH - Continuing anyway"
    PLATFORM="unknown"
fi

# Check operating system
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "❌ This script is designed for macOS only. Current OS: $OSTYPE"
    exit 1
fi

print_success "✅ macOS detected successfully"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -ti:"$1" >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    local port=$1
    if port_in_use "$port"; then
        local pid=$(lsof -ti:"$port")
        print_warning "🛑 Killing process on port $port (PID: $pid)"
        kill -9 "$pid" 2>/dev/null || true
        sleep 2
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "⏳ Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" >/dev/null 2>&1; then
            print_success "✅ $service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    print_error "❌ $service_name failed to start within expected time"
    return 1
}

# Pre-flight checks
print_status "🔍 Running pre-flight checks..."

# Check required commands
if ! command_exists node; then
    print_error "❌ Node.js is not installed. Please install from https://nodejs.org/"
    exit 1
fi

if ! command_exists python3; then
    print_error "❌ Python 3 is not installed. Please install via: brew install python@3.9"
    exit 1
fi

if ! command_exists npm; then
    print_error "❌ npm is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "❌ Node.js version 18+ required. Current version: $(node --version)"
    print_error "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

print_success "✅ All required commands found (Node.js $(node --version))"

# Create necessary directories
mkdir -p logs
mkdir -p ai/venv

# Cleanup existing processes
print_status "🧹 Cleaning up existing processes..."
kill_port 3000  # Frontend
kill_port 7000  # Backend  
kill_port 8000  # AI Service
kill_port 8545  # Blockchain

print_success "✅ Cleanup complete"


# Install Node.js dependencies
print_status "📦 Installing Node.js dependencies..."
if [ ! -d "node_modules" ] || [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "blockchain/node_modules" ]; then
    print_status "Installing dependencies for all services..."
    # Install dependencies individually to handle version conflicts
    cd backend && npm install
    cd ../frontend && npm install
    cd ../blockchain && npm install
    cd ..
    print_success "✅ Node.js dependencies installed"
else
    print_success "✅ Node.js dependencies already installed"
fi

# Setup Python virtual environment
print_status "🐍 Setting up Python virtual environment..."
cd ai
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

print_status "Installing Python dependencies..."
source venv/bin/activate
pip install -r requirements.txt >/dev/null 2>&1
deactivate
cd ..
print_success "✅ Python environment ready"

# Setup environment files
print_status "⚙️ Setting up environment files..."

# Backend environment
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
    else
        cat > backend/.env << 'EOF'
PORT=7000
CORS_ORIGIN=http://localhost:3000
ETH_RPC_URL=http://127.0.0.1:8545
HEALTH_CONTRACT_ADDRESS=
DEPLOYER_PRIVATE_KEY=
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/
AI_SERVICE_URL=http://localhost:8000
EOF
    fi
    print_status "📝 Created backend/.env file"
fi

# Frontend environment
if [ ! -f "frontend/.env" ]; then
    if [ -f "frontend/.env.example" ]; then
        cp frontend/.env.example frontend/.env
    else
        cat > frontend/.env << 'EOF'
REACT_APP_CONTRACT_ADDRESS=
REACT_APP_BACKEND_URL=http://localhost:7000
REACT_APP_BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
REACT_APP_CHAIN_ID=31337
EOF
    fi
    print_status "📝 Created frontend/.env file"
fi

print_success "✅ Environment files ready"

# Start services
print_status "🚀 Starting all services..."

# Store PIDs for cleanup
BLOCKCHAIN_PID=""
AI_PID=""
BACKEND_PID=""
FRONTEND_PID=""

# Start Blockchain Network
print_status "🔗 Starting blockchain network (Hardhat)..."
cd blockchain
npm run node > ../logs/blockchain.log 2>&1 &
BLOCKCHAIN_PID=$!
cd ..

print_status "⏳ Waiting for blockchain to initialize..."
sleep 10

# Check if blockchain is running
if ! kill -0 "$BLOCKCHAIN_PID" 2>/dev/null; then
    print_error "❌ Blockchain failed to start. Check logs/blockchain.log"
    exit 1
fi
print_success "✅ Blockchain network started (PID: $BLOCKCHAIN_PID)"

# Deploy Smart Contract
print_status "📋 Deploying smart contract..."
cd blockchain
CONTRACT_ADDRESS=$(npm run deploy 2>/dev/null | grep -oE '0x[a-fA-F0-9]{40}' | head -1 || echo "")
cd ..

if [ -z "$CONTRACT_ADDRESS" ]; then
    print_warning "⚠️ Contract deployment may have failed. Trying alternative method..."
    cd blockchain
    npx hardhat run scripts/deploy.js --network localhost > ../logs/deploy.log 2>&1
    CONTRACT_ADDRESS=$(cat ../logs/deploy.log | grep -oE '0x[a-fA-F0-9]{40}' | head -1 || echo "")
    cd ..
fi

if [ ! -z "$CONTRACT_ADDRESS" ]; then
    print_success "✅ Contract deployed at: $CONTRACT_ADDRESS"
    
    # Update environment files with contract address
    if [ -f "backend/.env" ]; then
        sed -i '' "s/HEALTH_CONTRACT_ADDRESS=.*/HEALTH_CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" backend/.env
        print_status "📝 Updated backend/.env with contract address"
    fi
    
    if [ -f "frontend/.env" ]; then
        sed -i '' "s/REACT_APP_CONTRACT_ADDRESS=.*/REACT_APP_CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" frontend/.env
        print_status "📝 Updated frontend/.env with contract address"
    fi
else
    print_error "❌ Failed to deploy contract. Check logs/blockchain.log"
fi

# Start AI Service
print_status "🧠 Starting AI service..."
cd ai
source venv/bin/activate
python ai_server.py > ../logs/ai.log 2>&1 &
AI_PID=$!
deactivate
cd ..

print_success "✅ AI service started (PID: $AI_PID)"

# Wait for AI service
wait_for_service "http://localhost:8000" "AI Service"

# Start Backend
print_status "🔧 Starting backend server..."
cd backend
node index.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

print_success "✅ Backend server started (PID: $BACKEND_PID)"

# Wait for backend
wait_for_service "http://localhost:7000/health" "Backend API"

# Start Frontend
print_status "🎨 Starting frontend application..."
cd frontend
npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

print_success "✅ Frontend application started (PID: $FRONTEND_PID)"

# Wait for frontend
wait_for_service "http://localhost:3000" "Frontend App"

# Save PIDs for cleanup
echo "$BLOCKCHAIN_PID" > logs/blockchain.pid
echo "$AI_PID" > logs/ai.pid
echo "$BACKEND_PID" > logs/backend.pid
echo "$FRONTEND_PID" > logs/frontend.pid

# Final status report
echo ""
echo -e "${GREEN}🎉 ============================================${NC}"
echo -e "${GREEN}🎉       CAREVAULT STARTUP COMPLETE!          ${NC}"
echo -e "${GREEN}🎉 ============================================${NC}"
echo ""
echo -e "${WHITE}📊 Service Status:${NC}"
echo -e "  🔗 Blockchain: ${GREEN}Running${NC} (PID: $BLOCKCHAIN_PID) - http://localhost:8545"
echo -e "  🧠 AI Service: ${GREEN}Running${NC} (PID: $AI_PID) - http://localhost:8000"
echo -e "  🔧 Backend API: ${GREEN}Running${NC} (PID: $BACKEND_PID) - http://localhost:7000"
echo -e "  🎨 Frontend: ${GREEN}Running${NC} (PID: $FRONTEND_PID) - http://localhost:3000"
echo ""

if [ ! -z "$CONTRACT_ADDRESS" ]; then
    echo -e "${WHITE}📋 Smart Contract: ${GREEN}$CONTRACT_ADDRESS${NC}"
fi

echo ""
echo -e "${CYAN}🌐 Application URLs:${NC}"
echo -e "  • Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "  • Backend: ${BLUE}http://localhost:7000${NC}"
echo -e "  • AI Service: ${BLUE}http://localhost:8000${NC}"
echo -e "  • Blockchain: ${BLUE}http://localhost:8545${NC}"
echo ""

echo -e "${YELLOW}📝 Next Steps:${NC}"
echo -e "  1. ${WHITE}Open${NC} ${BLUE}http://localhost:3000${NC} ${WHITE}in your browser${NC}"
echo -e "  2. ${WHITE}Connect your${NC} ${BLUE}MetaMask wallet${NC}"
echo -e "  3. ${WHITE}Import account using private key from blockchain logs${NC}"
echo -e "  4. ${WHITE}Test patient and doctor workflows${NC}"
echo ""

echo -e "${PURPLE}📁 Log files:${NC} ./logs/ directory"
echo -e "${PURPLE}🛑 To stop all services:${NC} ./stop_all.sh"
echo ""

print_success "🎯 CareVault is now ready for your presentation!"

# Create stop script
cat > stop_all.sh << 'EOF'
#!/bin/bash

# CareVault - Stop All Services Script
echo "🛑 Stopping CareVault services..."

# Kill processes using stored PIDs
for pid_file in logs/*.pid; do
    if [ -f "$pid_file" ]; then
        service_name=$(basename "$pid_file" .pid)
        pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "Stopping $service_name (PID: $pid)..."
            kill "$pid" 2>/dev/null || true
        fi
        rm "$pid_file"
    fi
done

# Kill any remaining processes on our ports
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:7000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:8545 | xargs kill -9 2>/dev/null || true

echo "✅ All services stopped!"
EOF

chmod +x stop_all.sh

# Create health check script
cat > health_check.sh << 'EOF'
#!/bin/bash

echo "🔍 CareVault Health Check"

# Check each service
echo -n "Blockchain (8545): "
curl -s http://localhost:8545 >/dev/null && echo "✅ OK" || echo "❌ DOWN"

echo -n "Backend (7000): "
curl -s http://localhost:7000/health >/dev/null && echo "✅ OK" || echo "❌ DOWN"

echo -n "AI Service (8000): "
curl -s http://localhost:8000 >/dev/null && echo "✅ OK" || echo "❌ DOWN"

echo -n "Frontend (3000): "
curl -s -I http://localhost:3000 | grep -q "200 OK" && echo "✅ OK" || echo "❌ DOWN"
EOF

chmod +x health_check.sh

print_success "✅ Additional scripts created: stop_all.sh, health_check.sh"
