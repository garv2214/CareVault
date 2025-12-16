# CareVault - How to Run Project

## 🎯 Overview

CareVault is a decentralized health records system that runs locally for academic presentations. This guide provides step-by-step instructions to get the entire system running on macOS M1.

## 📋 Prerequisites

### Required Software
- **macOS** (Big Sur 11.0+ recommended for M1 compatibility)
- **Node.js** v18+ - [Download](https://nodejs.org/) or install via Homebrew:
  ```bash
  brew install node
  ```
- **Python 3.9+** - Install via Homebrew:
  ```bash
  brew install python@3.9
  ```
- **MetaMask** browser extension - [Install](https://metamask.io/)
- **Git** (for version control)

### Check Installation
```bash
node --version    # Should show v18+
python3 --version # Should show 3.9+
npm --version     # Should show 6+
```

## 🏗️ Project Structure

```
decentralized-health-records/
├── frontend/           # React web application (Port 3000)
├── backend/            # Node.js API server (Port 7000)
├── ai/                 # Python AI service (Port 8000)
├── blockchain/         # Ethereum smart contracts (Port 8545)
├── scripts/            # Utility scripts
├── start_all.sh        # Single command startup
├── RUN_PROJECT.md      # This file
└── start.sh           # Alternative startup script
```

## 🚀 Quick Start (One Command)

### Option 1: Automated Startup (Recommended)
```bash
chmod +x start_all.sh
./start_all.sh
```

### Option 2: Manual Startup
```bash
# 1. Install dependencies
npm run install:all

# 2. Setup Python environment
cd ai && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && cd ..

# 3. Start all services (4 terminals needed)
# Terminal 1:
npm run start:blockchain

# Terminal 2 (new terminal):
npm run deploy:local

# Terminal 3 (new terminal):
npm run start:ai

# Terminal 4 (new terminal):
npm run start:backend

# Terminal 5 (new terminal):
npm run start:frontend
```

## ⚙️ Environment Setup

### Backend Environment (.env)
Create `backend/.env`:
```bash
# Server Configuration
PORT=7000
CORS_ORIGIN=http://localhost:3000

# Blockchain Configuration
ETH_RPC_URL=http://127.0.0.1:8545
HEALTH_CONTRACT_ADDRESS=0x... # Will be filled after deployment
DEPLOYER_PRIVATE_KEY=0x...   # From blockchain logs

# External Services
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/
AI_SERVICE_URL=http://localhost:8000
```

### Frontend Environment (.env)
Create `frontend/.env`:
```bash
# Application Configuration
REACT_APP_CONTRACT_ADDRESS=0x... # Same as backend
REACT_APP_BACKEND_URL=http://localhost:7000
REACT_APP_BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
REACT_APP_CHAIN_ID=31337
```

### AI Environment (.env)
Create `ai/.env`:
```bash
FLASK_ENV=development
FLASK_DEBUG=1
MODEL_PATH=./model/risk_model.pkl
```

## 🔧 Startup Sequence

### Service Startup Order (Important!)

1. **Blockchain Network** (Hardhat)
   - Runs on port 8545
   - Provides test accounts and private keys
   - Must start first to get contract deployment address

2. **Smart Contract Deployment**
   - Deploys HealthRecord.sol to local blockchain
   - Provides contract address for other services
   - Takes ~10-30 seconds

3. **AI Service** (Python Flask)
   - Runs on port 8000
   - Provides risk prediction and summarization
   - Dependencies: Python + virtual environment

4. **Backend Server** (Node.js Express)
   - Runs on port 7000
   - Connects blockchain and IPFS
   - Provides API endpoints for frontend

5. **Frontend Application** (React)
   - Runs on port 3000
   - Connects to MetaMask wallet
   - User interface for all operations

## 🎯 Expected Output

### Successful Startup Sequence:
```
✅ Blockchain node started (Port 8545)
✅ Contract deployed at: 0x1234...
✅ AI service running (Port 8000)
✅ Backend API running (Port 7000)
✅ Frontend app running (Port 3000)

🌐 Open http://localhost:3000 in browser
🔗 Connect MetaMask wallet
```

### Service URLs:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:7000
- **AI Service**: http://localhost:8000
- **Blockchain RPC**: http://localhost:8545

## 🔗 MetaMask Setup

### 1. Add Local Network
- Network Name: `Localhost 8545`
- RPC URL: `http://localhost:8545`
- Chain ID: `31337`
- Currency Symbol: `ETH`

### 2. Import Test Account
- Get private key from blockchain startup logs
- Import account using private key
- Use this account for testing

## 🧪 Testing the Application

### Patient Workflow
1. Connect MetaMask wallet
2. Go to "Patient" tab
3. Click "Add New Record"
4. Fill health information
5. Submit and wait for confirmation

### Doctor Workflow
1. Connect different MetaMask account
2. Go to "Doctor" tab
3. Enter patient ID
4. Request access to records
5. View patient data after authorization

### Emergency Access
1. Go to "Emergency" tab
2. Enter patient ID
3. Enter emergency reason
4. Access emergency summary

## 🐛 Common Errors & Quick Fixes

### Error: "Port already in use"
**Solution:**
```bash
# Kill processes on specific ports
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:7000 | xargs kill -9  # Backend
lsof -ti:8000 | xargs kill -9  # AI Service
lsof -ti:8545 | xargs kill -9  # Blockchain

# Or use the cleanup script:
./stop.sh
```

### Error: "Module not found"
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm run install:all

# For Python:
cd ai
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Error: "Cannot connect to blockchain"
**Solution:**
```bash
# Check if blockchain is running
curl http://localhost:8545

# Restart blockchain
npm run start:blockchain
```

### Error: "Contract not found"
**Solution:**
```bash
# Redeploy contract
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
# Update contract address in .env files
```

### Error: "Python virtual environment"
**Solution:**
```bash
# Recreate Python environment
cd ai
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 📊 Health Checks

### Verify All Services
```bash
# Check backend
curl http://localhost:7000/health

# Check AI service
curl http://localhost:8000/

# Check blockchain
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545

# Check frontend
curl -I http://localhost:3000
```

### Expected Responses:
- Backend: `{"status":"healthy",...}`
- AI Service: `AI service running`
- Blockchain: `{"jsonrpc":"2.0","result":"0x..."}`
- Frontend: `HTTP/1.1 200 OK`

## 🎉 Success Indicators

### Visual Confirmation
- ✅ All 5 services running without errors
- ✅ Contract address displayed in logs
- ✅ Frontend loads at http://localhost:3000
- ✅ MetaMask connects successfully
- ✅ Health record submission works
- ✅ Blockchain transactions complete

### Performance Notes
- First startup takes 2-5 minutes (dependencies)
- Subsequent startups take 30-60 seconds
- Blockchain sync is instant (local network)
- All services should be responsive

## 📞 Support

### For Live Presentations:
1. **Test everything 30 minutes before**
2. **Keep terminal windows open**
3. **Have backup private keys ready**
4. **Practice the demo flow**
5. **Monitor service logs for issues**

### Troubleshooting Priority:
1. Check all ports are available
2. Verify environment variables
3. Restart services in correct order
4. Check browser console for errors
5. Review service logs for details

---

**🎯 Ready for Presentation!** 

The entire system should be accessible via http://localhost:3000 with full functionality for healthcare data management, blockchain integration, and AI-powered risk assessment.
