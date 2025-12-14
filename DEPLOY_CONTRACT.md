# 🔗 Deploy Contract to Sepolia

## Prerequisites

1. **Infura API Key** (free)
   - Go to https://infura.io
   - Sign up → Create project
   - Copy API key

2. **Sepolia ETH** (free testnet ETH)
   - Go to https://sepoliafaucet.com
   - Request test ETH to your wallet

3. **Wallet Private Key**
   - Export from MetaMask (Settings → Security & Privacy → Show Private Key)
   - ⚠️ Keep this secret!

---

## Step 1: Create .env File

```bash
cd blockchain
```

Create `.env` file:
```bash
cat > .env << EOF
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_wallet_private_key_here
EOF
```

**Replace:**
- `YOUR_INFURA_KEY` with your Infura API key
- `your_wallet_private_key_here` with your wallet's private key (starts with `0x`)

---

## Step 2: Deploy Contract

```bash
cd /Users/garvsharma/decentralized-health-records/blockchain
npx hardhat run scripts/deploy.js --network sepolia
```

---

## Step 3: Copy Contract Address

After deployment, you'll see:
```
✅ HealthRecord deployed successfully!
📍 Contract address: 0x...
```

**Copy this address!** You'll need it for:
- Backend `.env`: `HEALTH_CONTRACT_ADDRESS=0x...`
- Frontend Vercel env vars: `REACT_APP_CONTRACT_ADDRESS=0x...`

---

## Step 4: Verify on Etherscan

1. Go to https://sepolia.etherscan.io
2. Search for your contract address
3. Verify it's deployed

---

## 🆘 Troubleshooting

### "No Hardhat config file found"
- Make sure you're in `blockchain/` directory
- Run: `cd /Users/garvsharma/decentralized-health-records/blockchain`

### "Invalid private key"
- Make sure private key starts with `0x`
- No spaces or quotes in `.env` file

### "Insufficient funds"
- Get Sepolia ETH from https://sepoliafaucet.com
- Make sure wallet has test ETH

### "Network error"
- Check Infura API key is correct
- Verify RPC URL format

---

## ✅ Quick Command

```bash
cd /Users/garvsharma/decentralized-health-records/blockchain
npx hardhat run scripts/deploy.js --network sepolia
```

---

**After deployment, update your backend and frontend with the contract address!**

