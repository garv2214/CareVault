# ⚡ Quick Guide - Get Running in 3 Minutes

## 🎯 Prerequisites
- Node.js installed
- Python 3.8+ installed  
- MetaMask browser extension

---

## 🚀 3-Step Setup

### Step 1: Install Everything
```bash
# Install all dependencies
npm run install:all

# Setup AI service
npm run setup:ai
```

### Step 2: Start Blockchain & Deploy
**Terminal 1:**
```bash
cd blockchain
npx hardhat node
```
**Keep this running!** You'll see test accounts.

**Terminal 2:**
```bash
npm run deploy:local
```
**Copy the contract address** (looks like `0x1234...`)

### Step 3: Configure & Start
**Edit these files:**

`backend/.env`:
```
HEALTH_CONTRACT_ADDRESS=<paste contract address>
```

`frontend/.env`:
```
REACT_APP_CONTRACT_ADDRESS=<paste contract address>
```

**Start services:**

**Terminal 3:**
```bash
cd ai && source venv/bin/activate && python ai_server.py
```

**Terminal 4:**
```bash
cd backend && node index.js
```

**Terminal 5:**
```bash
cd frontend && npm start
```

---

## ✅ Open & Connect

1. Go to `http://localhost:3000`
2. Click **"Connect Wallet"**
3. In MetaMask:
   - Add network: `http://localhost:8545` (Chain ID: 31337)
   - Import account: Use private key from Terminal 1

**📖 Need detailed MetaMask setup?** See `METAMASK_SETUP.md` for complete step-by-step guide.

---

## 🎉 You're Live!

- **Patient Tab**: Add health records
- **Doctor Tab**: Request access to records  
- **Emergency Tab**: Access emergency summaries

---

## 🆘 Quick Fixes

**"Contract not found"**  
→ Check contract address in both .env files

**"Cannot connect"**  
→ Make sure backend is running on port 5000

**"MetaMask not detected"**  
→ Install MetaMask extension

---

## 📦 One-Command Alternative

```bash
./start.sh
```
(After deploying contract and setting .env files)

---

**Need help?** See `DEPLOYMENT.md` for production deployment.

