# 🚀 Quick Deploy - Make It Live NOW!

## ⚡ Fastest Path to Production (30 minutes)

### What You Need:
1. GitHub account (free)
2. Vercel account (free) - https://vercel.com
3. Railway account (free) - https://railway.app  
4. Infura account (free) - https://infura.io
5. MetaMask wallet with Sepolia testnet

---

## 📋 Step-by-Step Deployment

### 1️⃣ Push to GitHub (5 min)

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Ready for deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/decentralized-health-records.git
git branch -M main
git push -u origin main
```

---

### 2️⃣ Deploy Smart Contract to Sepolia (10 min)

#### Get Infura Key:
1. Go to https://infura.io → Sign up
2. Create project → Copy API key

#### Get Sepolia ETH:
- https://sepoliafaucet.com (request free test ETH)

#### Deploy:
```bash
cd blockchain

# Create .env file
echo "SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY" >> .env
echo "PRIVATE_KEY=your_wallet_private_key" >> .env

# Deploy
npx hardhat run scripts/deploy.js --network sepolia
```

**Copy the contract address!**

---

### 3️⃣ Deploy Backend to Railway (10 min)

1. Go to https://railway.app
2. Sign up with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. **Settings → Root Directory:** `backend`
6. **Variables tab, add:**
   ```
   PORT=5000
   ETH_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   HEALTH_CONTRACT_ADDRESS=0x... (from step 2)
   DEPLOYER_PRIVATE_KEY=your_private_key
   AI_SERVICE_URL=http://localhost:8000
   ```
7. Click "Deploy"
8. **Copy the URL** (e.g., `https://carevault-backend.railway.app`)

---

### 4️⃣ Deploy Frontend to Vercel (5 min)

#### Option A: CLI (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
npm run build
vercel

# Follow prompts, then:
# Go to Vercel dashboard → Settings → Environment Variables
# Add:
#   REACT_APP_API_URL=https://your-backend.railway.app/api
#   REACT_APP_CONTRACT_ADDRESS=0x... (from step 2)
# Redeploy
```

#### Option B: GitHub Integration
1. Go to https://vercel.com
2. "Add New Project"
3. Import GitHub repo
4. **Root Directory:** `frontend`
5. **Build Command:** `npm run build`
6. **Output Directory:** `build`
7. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   REACT_APP_CONTRACT_ADDRESS=0x...
   ```
8. Deploy!

---

## ✅ Test Your Live App

1. Open your Vercel URL
2. Connect MetaMask → Switch to Sepolia network
3. Test adding a record
4. Everything should work! 🎉

---

## 🔗 Your Live URLs

- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-backend.railway.app`
- **Contract:** View on https://sepolia.etherscan.io

---

## 🆘 Quick Troubleshooting

**Backend not working?**
- Check Railway logs
- Verify environment variables
- Check CORS is enabled

**Frontend can't connect?**
- Verify `REACT_APP_API_URL` is correct
- Check backend URL is accessible
- Look at browser console

**Contract errors?**
- Make sure MetaMask is on Sepolia
- Verify contract address
- Check you have Sepolia ETH

---

## 💰 Cost: $0

All services offer free tiers:
- Vercel: Unlimited
- Railway: 500 hours/month
- Infura: Free tier
- Sepolia: Free testnet

---

## 🎉 You're Live!

Share your app URL with the world!

**Need help?** Check `DEPLOY_NOW.md` for detailed steps.

