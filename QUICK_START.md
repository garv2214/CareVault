# ⚡ Quick Start - Get Live in 5 Minutes!

## 🎯 What You Need

1. **Node.js** (v16+) - [Download](https://nodejs.org/)
2. **Python 3.8+** - [Download](https://www.python.org/)
3. **MetaMask** browser extension - [Install](https://metamask.io/)

## 🚀 Step-by-Step

### Step 1: Install Dependencies (One Time)

```bash
# Install backend & frontend dependencies
npm run install:all

# Setup AI service
npm run setup:ai
```

### Step 2: Start Local Blockchain

**Terminal 1:**
```bash
npm run start:blockchain
```

**Keep this running!** You'll see test accounts with private keys.

### Step 3: Deploy Smart Contract

**Terminal 2:**
```bash
npm run deploy:local
```

**Copy the contract address** (looks like `0x1234...`)

### Step 4: Configure Environment

**Backend:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
HEALTH_CONTRACT_ADDRESS=<paste your contract address>
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```
REACT_APP_CONTRACT_ADDRESS=<paste your contract address>
```

### Step 5: Start All Services

**Option A: Use the startup script**
```bash
./start.sh
```

**Option B: Manual (4 terminals)**

Terminal 1 (Blockchain - already running):
```bash
npm run start:blockchain
```

Terminal 2 (AI Service):
```bash
npm run start:ai
```

Terminal 3 (Backend):
```bash
npm run start:backend
```

Terminal 4 (Frontend):
```bash
npm run start:frontend
```

### Step 6: Connect MetaMask

1. Open `http://localhost:3000`
2. Click **"Connect Wallet"**
3. In MetaMask:
   - Add network: `http://localhost:8545` (Chain ID: 31337)
   - Import account using private key from Terminal 1 (Hardhat output)

## ✅ You're Live!

### Test the Application

1. **Patient Tab:**
   - Enter Patient ID (e.g., "patient-001")
   - Fill in health record form
   - Submit → Record stored on IPFS & Blockchain!

2. **Doctor Tab:**
   - Enter Patient ID
   - Request access
   - View records (after access granted)

3. **Emergency Tab:**
   - Enter Patient ID
   - Enter emergency reason
   - Access emergency summary

## 🌐 Make it Public (Deploy)

### Frontend → Vercel (Free)

```bash
cd frontend
npm run build
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard.

### Backend → Railway/Render (Free tier available)

1. Connect GitHub repo
2. Set environment variables
3. Deploy!

### Smart Contract → Sepolia Testnet

```bash
cd blockchain
# Update hardhat.config.js with Infura/Alchemy RPC
npx hardhat run scripts/deploy.js --network sepolia
```

## 📚 Full Documentation

- **Detailed Setup:** See `START.md`
- **Deployment Guide:** See `DEPLOYMENT.md`
- **Project Overview:** See `README.md`

## 🆘 Troubleshooting

**"Contract not found"**
→ Check contract address in both .env files

**"Cannot connect to backend"**
→ Make sure backend is running on port 5000

**"MetaMask not detected"**
→ Install MetaMask extension

**Port already in use**
→ Kill process using that port or change port in config

## 🎉 Success!

Your decentralized health records app is now running! 

Next: Deploy to production and share with the world! 🚀

