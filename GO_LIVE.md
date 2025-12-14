# 🚀 Go Live - Deploy CareVault to Production

Complete guide to make your CareVault app accessible on the internet.

---

## 🎯 Quick Deploy (15 minutes)

### Option 1: Vercel (Frontend) + Railway (Backend) - FREE

#### Step 1: Deploy Frontend to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Build frontend:**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   - Follow prompts
   - Say "Yes" to all questions
   - Copy the deployment URL

4. **Set Environment Variables in Vercel Dashboard:**
   - Go to your project on vercel.com
   - Settings → Environment Variables
   - Add:
     ```
     REACT_APP_API_URL=https://your-backend-url.railway.app/api
     REACT_APP_CONTRACT_ADDRESS=0x... (your deployed contract address)
     ```

#### Step 2: Deploy Backend to Railway

1. **Sign up:** https://railway.app (free tier available)

2. **Create new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
   - Select `backend` folder

3. **Set Environment Variables:**
   ```
   PORT=5000
   ETH_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   HEALTH_CONTRACT_ADDRESS=0x... (deployed contract)
   AI_SERVICE_URL=https://your-ai-service.railway.app
   IPFS_PROJECT_ID= (optional)
   IPFS_PROJECT_SECRET= (optional)
   ```

4. **Deploy:**
   - Railway auto-deploys
   - Copy the generated URL

#### Step 3: Deploy AI Service to Railway

1. **Create another Railway project**
2. **Select `ai` folder**
3. **Set Python runtime**
4. **Deploy**

#### Step 4: Deploy Smart Contract to Sepolia Testnet

1. **Get Infura/Alchemy API key:**
   - Sign up at https://infura.io
   - Create new project
   - Copy API key

2. **Update Hardhat config:**
   ```javascript
   // blockchain/hardhat.config.js
   networks: {
     sepolia: {
       url: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`,
       accounts: [process.env.PRIVATE_KEY]
     }
   }
   ```

3. **Deploy:**
   ```bash
   cd blockchain
   PRIVATE_KEY=your_wallet_private_key npx hardhat run scripts/deploy.js --network sepolia
   ```

4. **Copy contract address** and update all `.env` files

---

## 🌐 Option 2: Render (All Services) - FREE

### Frontend

1. **Sign up:** https://render.com
2. **New → Static Site**
3. **Connect GitHub repo**
4. **Build command:** `cd frontend && npm install && npm run build`
5. **Publish directory:** `frontend/build`
6. **Add environment variables**

### Backend

1. **New → Web Service**
2. **Connect GitHub repo**
3. **Root directory:** `backend`
4. **Build command:** `npm install`
5. **Start command:** `node index.js`
6. **Add environment variables**

---

## 🔧 Environment Variables Checklist

### Frontend (.env)
```bash
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_CONTRACT_ADDRESS=0x...
```

### Backend (.env)
```bash
PORT=5000
ETH_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
HEALTH_CONTRACT_ADDRESS=0x...
DEPLOYER_PRIVATE_KEY=your_private_key
AI_SERVICE_URL=https://your-ai-service.com
IPFS_PROJECT_ID= (optional)
IPFS_PROJECT_SECRET= (optional)
```

### AI Service
No environment variables needed (runs on port 8000)

---

## 📋 Pre-Deployment Checklist

- [ ] Smart contract deployed to testnet/mainnet
- [ ] Contract address copied
- [ ] All environment variables set
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend runs locally without errors
- [ ] MetaMask can connect to deployed network
- [ ] Tested all features locally

---

## 🚀 Quick Deploy Commands

### 1. Deploy Contract to Sepolia
```bash
cd blockchain
# Set your private key and Infura key
PRIVATE_KEY=0x... INFURA_KEY=... npx hardhat run scripts/deploy.js --network sepolia
```

### 2. Deploy Frontend to Vercel
```bash
cd frontend
npm run build
vercel --prod
```

### 3. Deploy Backend to Railway
- Use Railway dashboard (auto-deploys from GitHub)

---

## 🔗 Update Frontend After Backend Deploy

Once backend is deployed:

1. **Get backend URL** (e.g., `https://carevault-backend.railway.app`)
2. **Update Vercel environment variable:**
   ```
   REACT_APP_API_URL=https://carevault-backend.railway.app/api
   ```
3. **Redeploy frontend** (Vercel auto-redeploys on env change)

---

## 🧪 Test Your Live App

1. **Open your frontend URL** (e.g., `https://carevault.vercel.app`)
2. **Connect MetaMask**
   - Switch to Sepolia network (or your deployed network)
3. **Test features:**
   - Add a record
   - View records
   - Test doctor access
   - Test emergency access

---

## 🆘 Troubleshooting Live Deployment

### "Cannot connect to backend"
- Check backend URL is correct
- Verify CORS is enabled in backend
- Check backend logs on Railway/Render

### "Contract not found"
- Verify contract address is correct
- Make sure you're on the right network in MetaMask
- Check contract is deployed on that network

### "Transaction failed"
- Check you have testnet ETH (for Sepolia)
- Verify RPC URL is correct
- Check gas prices

---

## 💰 Cost Estimate

**FREE Options:**
- Vercel: Free tier (unlimited)
- Railway: Free tier (500 hours/month)
- Render: Free tier (limited)
- Sepolia Testnet: Free

**Total: $0/month** for testing/demo

---

## 🎉 Success!

Once deployed, share your app:
- Frontend URL: `https://your-app.vercel.app`
- Backend URL: `https://your-backend.railway.app`

**Your CareVault app is now live! 🚀**

---

## 📚 Next Steps

1. **Custom domain** (optional)
2. **SSL certificates** (auto-handled by Vercel/Railway)
3. **Monitoring** (set up error tracking)
4. **Analytics** (add Google Analytics)

---

**Ready to deploy? Start with Step 1 above!**

