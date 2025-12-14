# 🚀 Quick Start Guide

Get CareVault running in 5 minutes!

## Prerequisites

- Node.js installed
- Python 3.8+ installed
- MetaMask browser extension

## Step-by-Step Setup

### 1. Clone and Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# AI Service
cd ../ai
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Start Local Blockchain

```bash
cd blockchain
npm install
npx hardhat node
```

**Keep this terminal open!** This runs your local Ethereum node.

### 3. Deploy Smart Contract

In a **new terminal**:

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

**Copy the contract address** from the output (looks like `0x...`)

### 4. Configure Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
PORT=5000
ETH_RPC_URL=http://127.0.0.1:8545
HEALTH_CONTRACT_ADDRESS=<paste contract address here>
AI_SERVICE_URL=http://localhost:8000
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CONTRACT_ADDRESS=<paste contract address here>
```

### 5. Start All Services

Open **4 terminals**:

**Terminal 1 - Blockchain (already running):**
```bash
cd blockchain
npx hardhat node
```

**Terminal 2 - AI Service:**
```bash
cd ai
source venv/bin/activate
python ai_server.py
```

**Terminal 3 - Backend:**
```bash
cd backend
node index.js
```

**Terminal 4 - Frontend:**
```bash
cd frontend
npm start
```

### 6. Open in Browser

1. Open `http://localhost:3000`
2. Click "Connect Wallet" (MetaMask will pop up)
3. Select "Localhost 8545" network in MetaMask
4. Import one of the test accounts from Hardhat (check terminal 1 for private keys)

## You're Ready! 🎉

- **Patient Tab**: Add health records
- **Doctor Tab**: Request access to patient records
- **Emergency Tab**: Access emergency summaries

## Troubleshooting

**"Contract not found"**
- Make sure you copied the contract address correctly
- Restart frontend after updating .env

**"Cannot connect to backend"**
- Check backend is running on port 5000
- Verify CORS is enabled

**"MetaMask not detected"**
- Install MetaMask browser extension
- Refresh the page

## Next Steps

- Read `DEPLOYMENT.md` for production deployment
- Check `README.md` for full documentation

