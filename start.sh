#!/bin/bash

# CareVault Startup Script for macOS M1
# This script automates the setup and startup process

set -e  # Exit on any error

echo "🚀 Starting CareVault Setup for macOS M1..."

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

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS. Current OS: $OSTYPE"
    exit 1
fi

# Check if we're on Apple Silicon
if [[ $(uname -m) != "arm64" ]]; then
    print_warning "This script is optimized for Apple Silicon (M1/M2). Current architecture: $(uname -m)"
    echo "Continuing anyway..."
fi

# Check for required tools
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

print_status "Checking required tools..."
check_command node
check_command npm
check_command python3

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ required. Current version: $(node --version)"
    print_error "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

print_success "All required tools found!"

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        print_warning "Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
    fi
}

# Kill existing processes
print_status "Cleaning up existing processes..."
kill_port 3000  # Frontend
kill_port 7000  # Backend  
kill_port 8000  # AI Service
kill_port 8545  # Blockchain

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "blockchain/node_modules" ]; then
    print_status "Installing Node.js dependencies..."
    npm run install:all
fi

# Setup Python virtual environment
print_status "Setting up Python virtual environment..."
cd ai
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

# Setup environment files
print_status "Setting up environment files..."

# Backend environment
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    print_warning "Please update backend/.env with your configuration"
fi

# Frontend environment
if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    print_warning "Please update frontend/.env with your configuration"
fi

print_success "Environment setup complete!"

# Start services in background
print_status "Starting services..."

# Function to start service and log
start_service() {
    local service_name=$1
    local command=$2
    local log_file="logs/${service_name}.log"
    
    # Create logs directory
    mkdir -p logs
    
    print_status "Starting $service_name..."
    nohup $command > $log_file 2>&1 &
    local pid=$!
    echo $pid > "logs/${service_name}.pid"
    print_success "$service_name started (PID: $pid, Log: $log_file)"
}

# Start blockchain node
print_status "Starting blockchain node..."
mkdir -p logs
start_service "blockchain" "cd blockchain && npm run node"

# Wait for blockchain to start
print_status "Waiting for blockchain to initialize..."
sleep 5

# Deploy contract
print_status "Deploying smart contract..."
cd blockchain
CONTRACT_ADDRESS=$(npm run deploy 2>/dev/null | grep -o '0x[a-fA-F0-9]\{40\}' | head -1)
cd ..

if [ ! -z "$CONTRACT_ADDRESS" ]; then
    print_success "Contract deployed at: $CONTRACT_ADDRESS"
    
    # Update environment files with contract address
    if [ -f "backend/.env" ]; then
        sed -i '' "s/HEALTH_CONTRACT_ADDRESS=.*/HEALTH_CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" backend/.env
        print_success "Updated backend/.env with contract address"
    fi
    
    if [ -f "frontend/.env" ]; then
        sed -i '' "s/REACT_APP_CONTRACT_ADDRESS=.*/REACT_APP_CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" frontend/.env
        print_success "Updated frontend/.env with contract address"
    fi
else
    print_error "Failed to deploy contract. Check logs/blockchain.log for details."
fi

# Start AI service
start_service "ai" "cd ai && source venv/bin/activate && python ai_server.py"

# Start backend
start_service "backend" "cd backend && node index.js"

# Start frontend
start_service "frontend" "cd frontend && npm start"

print_success "🎉 All services started!"
echo ""
echo "📊 Service Status:"
echo "  • Blockchain: http://localhost:8545"
echo "  • AI Service: http://localhost:8000"
echo "  • Backend: http://localhost:7000"
echo "  • Frontend: http://localhost:3000"
echo ""
echo "📋 Next Steps:"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Connect your MetaMask wallet"
echo "  3. Import account using private key from blockchain logs"
echo ""
echo "🔍 Logs location: ./logs/"
echo "🛑 To stop all services: ./stop.sh"

# Create stop script
cat > stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping CareVault services..."

# Kill processes using stored PIDs
for pid_file in logs/*.pid; do
    if [ -f "$pid_file" ]; then
        service_name=$(basename "$pid_file" .pid)
        pid=$(cat "$pid_file")
        if kill -0 $pid 2>/dev/null; then
            echo "Stopping $service_name (PID: $pid)..."
            kill $pid
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

chmod +x stop.sh

echo ""
print_success "Setup complete! Check the browser at http://localhost:3000"
