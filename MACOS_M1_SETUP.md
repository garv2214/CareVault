# CareVault Setup Guide for macOS M1 (Apple Silicon)

## 📋 Prerequisites

### 1. Install Homebrew (if not already installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js (v18+)
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/ (recommended for M1)
```

### 3. Install Python 3.9+
```bash
brew install python@3.9
```

### 4. Install MetaMask
Download from https://metamask.io/ and install the browser extension.

## 🚀 Quick Start Setup

### Step 1: Clone and Setup Project
```bash
git clone <repository-url>
cd decentralized-health-records
```

### Step 2: Install Dependencies
```bash
# Install all Node.js dependencies
npm run install:all

# Setup Python virtual environment
cd ai
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..
```

### Step 3: Environment Configuration

#### Backend Environment
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```bash
PORT=7000
HEALTH_CONTRACT_ADDRESS=
ETH_RPC_URL=http://127.0.0.1:8545
DEPLOYER_PRIVATE_KEY=
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/
AI_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:3000
```

#### Frontend Environment
```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```bash
REACT_APP_CONTRACT_ADDRESS=
REACT_APP_BACKEND_URL=http://localhost:7000
REACT_APP_BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
REACT_APP_CHAIN_ID=31337
```

### Step 4: Start Services

#### Option A: Automated Startup
```bash
# From project root
./start.sh
```

#### Option B: Manual Startup (4 terminals)

**Terminal 1 - Blockchain:**
```bash
npm run start:blockchain
```
Keep this running! Note the private keys shown.

**Terminal 2 - Deploy Contract:**
```bash
npm run deploy:local
```
Copy the contract address from output.

**Terminal 3 - AI Service:**
```bash
npm run start:ai
```

**Terminal 4 - Backend:**
```bash
npm run start:backend
```

**Terminal 5 - Frontend:**
```bash
npm run start:frontend
```

### Step 5: Update Environment with Contract Address

1. Copy the contract address from Terminal 2
2. Update `backend/.env`: `HEALTH_CONTRACT_ADDRESS=<contract_address>`
3. Update `frontend/.env`: `REACT_APP_CONTRACT_ADDRESS=<contract_address>`

### Step 6: Connect MetaMask

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. In MetaMask:
   - Add network: `http://localhost:8545` (Chain ID: 31337)
   - Import account using private key from Terminal 1

## 🎯 Testing the Application

### Patient Workflow
1. Connect wallet as Patient
2. Click "Add New Record"
3. Fill form with health data
4. Submit → Should show success with transaction hash

### Doctor Workflow
1. Connect different wallet as Doctor
2. Request access to patient records
3. View records after authorization

### Emergency Access
1. Enter patient ID
2. Enter emergency reason
3. Access emergency summary

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:7000 | xargs kill -9  # Backend
lsof -ti:8000 | xargs kill -9  # AI Service
lsof -ti:8545 | xargs kill -9  # Blockchain
```

#### Permission Errors
```bash
# Make scripts executable
chmod +x start.sh
chmod +x *.sh
```

#### Python Virtual Environment Issues
```bash
# Recreate virtual environment
cd ai
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### MetaMask Connection Issues
1. Check if Hardhat is running on port 8545
2. Verify chain ID is 31337
3. Import the correct private key from Hardhat output

### Performance Tips for M1
- Use Node.js v18+ for better Apple Silicon support
- Consider using `nvm` for Node version management
- Close unused applications to free up memory

## 📱 Production Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
npm install -g vercel
vercel
```

### Backend (Railway/Heroku)
- Set environment variables in platform dashboard
- Ensure all required ports are configured

### Blockchain (Sepolia Testnet)
```bash
cd blockchain
# Update hardhat.config.js with RPC URL and private key
npx hardhat run scripts/deploy.js --network sepolia
```

## 🎉 Success!

Your CareVault application should now be running with:
- ✅ Enhanced UI with loading states and animations
- ✅ Form validation and error handling
- ✅ Blockchain integration working
- ✅ IPFS storage functional
- ✅ AI risk prediction working
- ✅ Responsive design for presentations

The application is now presentation-ready with improved user experience!
