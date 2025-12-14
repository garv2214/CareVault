# ⚡ Deploy Now - Step by Step

## 🎯 Fastest Way to Go Live (30 minutes)

### Prerequisites
- GitHub account
- MetaMask wallet with Sepolia ETH (for testnet)
- Infura account (free) - https://infura.io

---

## Step 1: Deploy Smart Contract (5 min)

### 1.1 Get Infura API Key
1. Go to https://infura.io
2. Sign up (free)
3. Create new project
4. Copy API key

### 1.2 Update Hardhat Config
```bash
cd blockchain
```

Edit `hardhat.config.js` - add Sepolia network:
```javascript
networks: {
  sepolia: {
    url: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

### 1.3 Deploy to Sepolia
```bash
PRIVATE_KEY=your_wallet_private_key npx hardhat run scripts/deploy.js --network sepolia
```

**Copy the contract address!**

### 1.4 Get Sepolia ETH
- Go to https://sepoliafaucet.com
- Request test ETH (free)

---

## Step 2: Deploy Backend to Railway (10 min)

### 2.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/decentralized-health-records.git
git push -u origin main
```

### 2.2 Deploy on Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. **Set root directory:** `backend`
6. **Add environment variables:**
   ```
   PORT=5000
   ETH_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   HEALTH_CONTRACT_ADDRESS=0x... (from step 1.3)
   DEPLOYER_PRIVATE_KEY=your_private_key
   AI_SERVICE_URL=http://localhost:8000
   ```
7. Click "Deploy"
8. **Copy the generated URL** (e.g., `https://carevault-backend.railway.app`)

---

## Step 3: Deploy Frontend to Vercel (10 min)

### 3.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 3.2 Build Frontend
```bash
cd frontend
npm run build
```

### 3.3 Deploy
```bash
vercel
```
- Follow prompts
- Say "Yes" to all

### 3.4 Set Environment Variables
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app/api
   REACT_APP_CONTRACT_ADDRESS=0x... (from step 1.3)
   ```
5. Redeploy (Settings → Deployments → Redeploy)

---

## Step 4: Test Live App (5 min)

1. **Open your Vercel URL** (e.g., `https://carevault.vercel.app`)
2. **Connect MetaMask:**
   - Switch to Sepolia network
   - Add network if needed:
     - Network Name: Sepolia
     - RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
     - Chain ID: 11155111
     - Currency: ETH
3. **Test:**
   - Add a record
   - View records
   - Everything should work!

---

## ✅ You're Live!

**Your app URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.railway.app`

**Share with the world! 🎉**

---

## 🆘 Quick Fixes

### Backend not responding
- Check Railway logs
- Verify environment variables
- Check CORS settings

### Frontend can't connect
- Verify `REACT_APP_API_URL` is correct
- Check backend is running
- Look at browser console

### Contract errors
- Make sure MetaMask is on Sepolia
- Verify contract address is correct
- Check you have Sepolia ETH

---

## 📝 Summary

1. ✅ Deploy contract to Sepolia
2. ✅ Deploy backend to Railway
3. ✅ Deploy frontend to Vercel
4. ✅ Set environment variables
5. ✅ Test everything

**Total time: ~30 minutes**
**Cost: $0 (all free tiers)**

---

**Ready? Start with Step 1! 🚀**

