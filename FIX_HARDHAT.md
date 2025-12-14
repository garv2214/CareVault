# 🔧 Fix: Hardhat Config Not Found

## Problem
You're running Hardhat from the wrong directory. The config file is in `blockchain/` folder.

## ✅ Solution: Use One of These Methods

### Method 1: Use NPM Scripts (Easiest - From Root Directory)

From the **root directory** (`decentralized-health-records/`), use:

```bash
# Start Hardhat node
npm run start:blockchain

# Deploy contract
npm run deploy:local
```

These scripts automatically `cd` into the blockchain directory.

---

### Method 2: Change Directory First

```bash
# Go to blockchain directory
cd blockchain

# Then run Hardhat commands
npx hardhat node
# OR
npx hardhat run scripts/deploy.js --network localhost
```

---

### Method 3: Use Full Path

```bash
# From root directory, specify the path
cd blockchain && npx hardhat node
```

---

## 🎯 Quick Fix Right Now

**If you're in the root directory**, just run:

```bash
npm run start:blockchain
```

This will:
1. Change to `blockchain/` directory
2. Run `npx hardhat node`
3. Start your local blockchain

---

## 📋 All Available Commands

From **root directory**, you can use:

```bash
# Start blockchain node
npm run start:blockchain

# Deploy contract
npm run deploy:local

# Start AI service
npm run start:ai

# Start backend
npm run start:backend

# Start frontend
npm run start:frontend
```

---

## ✅ Verify It Works

After running `npm run start:blockchain`, you should see:

```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts:
Account #0: 0x... (10000 ETH)
Account #1: 0x... (10000 ETH)
...
```

If you see this, it's working! 🎉

---

## 🆘 Still Having Issues?

1. **Make sure you're in the project root** (`decentralized-health-records/`)
2. **Check that `blockchain/hardhat.config.js` exists**
3. **Install dependencies**: `cd blockchain && npm install`
4. **Try the npm script**: `npm run start:blockchain`

