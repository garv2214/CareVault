# 🚀 Deployment Guide

This guide will help you deploy the CareVault application to make it live.

## Prerequisites

- Node.js (v16+)
- Python 3.8+
- MetaMask browser extension
- Hardhat (for blockchain)
- IPFS node or Infura IPFS account (optional)

## Quick Start (Local Development)

### 1. Start Blockchain (Hardhat)

```bash
cd blockchain
npm install
npx hardhat node  # Keep this terminal open
```

In a new terminal:
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

Copy the contract address and add it to `backend/.env` and `frontend/.env`

### 2. Start AI Service

```bash
cd ai
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python ai_server.py
```

The AI service will run on `http://localhost:8000`

### 3. Start Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your contract address and other configs
node index.js
```

Backend will run on `http://localhost:5000`

### 4. Start Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your contract address and API URL
npm start
```

Frontend will run on `http://localhost:3000`

## Production Deployment

### Option 1: Deploy to Vercel/Netlify (Frontend)

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Set environment variables in Vercel dashboard:**
   - `REACT_APP_API_URL` - Your backend API URL
   - `REACT_APP_CONTRACT_ADDRESS` - Deployed contract address

### Option 2: Deploy to Railway/Render (Backend)

1. **Create account on Railway or Render**

2. **Connect your GitHub repository**

3. **Set environment variables:**
   - `PORT=5000`
   - `ETH_RPC_URL` - Your Ethereum RPC endpoint
   - `HEALTH_CONTRACT_ADDRESS` - Deployed contract address
   - `IPFS_PROJECT_ID` - (Optional) Infura IPFS credentials
   - `IPFS_PROJECT_SECRET` - (Optional)
   - `AI_SERVICE_URL` - Your AI service URL

4. **Deploy**

### Option 3: Deploy to Heroku

#### Backend:
```bash
cd backend
heroku create your-app-name
heroku config:set ETH_RPC_URL=...
heroku config:set HEALTH_CONTRACT_ADDRESS=...
git push heroku main
```

#### AI Service:
```bash
cd ai
heroku create your-ai-app-name
# Add requirements.txt and Procfile
git push heroku main
```

### Option 4: Deploy Smart Contract to Testnet/Mainnet

1. **Update Hardhat config:**
   ```javascript
   // hardhat.config.js
   networks: {
     sepolia: {
       url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
       accounts: [PRIVATE_KEY]
     }
   }
   ```

2. **Deploy:**
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

3. **Update contract address in all .env files**

## Environment Variables Checklist

### Frontend (.env)
- [ ] `REACT_APP_API_URL` - Backend API URL
- [ ] `REACT_APP_CONTRACT_ADDRESS` - Smart contract address

### Backend (.env)
- [ ] `PORT` - Server port (default: 5000)
- [ ] `ETH_RPC_URL` - Ethereum RPC endpoint
- [ ] `DEPLOYER_PRIVATE_KEY` - Wallet private key (for transactions)
- [ ] `HEALTH_CONTRACT_ADDRESS` - Smart contract address
- [ ] `IPFS_PROJECT_ID` - (Optional) Infura IPFS project ID
- [ ] `IPFS_PROJECT_SECRET` - (Optional) Infura IPFS secret
- [ ] `AI_SERVICE_URL` - AI service URL

### AI Service
- No environment variables needed (runs on port 8000)

## Testing the Deployment

1. **Connect MetaMask** to your deployed network
2. **Add records** as a patient
3. **Test access control** as a doctor
4. **Test emergency access**

## Troubleshooting

### Frontend can't connect to backend
- Check CORS settings in backend
- Verify `REACT_APP_API_URL` is correct
- Check backend is running

### Blockchain transactions failing
- Verify contract address is correct
- Check network matches (localhost vs testnet)
- Ensure wallet has enough ETH for gas

### IPFS uploads failing
- Check IPFS credentials if using Infura
- Try public IPFS gateway as fallback
- Verify IPFS service is accessible

## Security Notes

⚠️ **Never commit `.env` files to git**
⚠️ **Never expose private keys**
⚠️ **Use environment variables for all secrets**
⚠️ **Enable HTTPS in production**

## Support

For issues, check:
- Backend logs
- Browser console
- Blockchain transaction receipts
- IPFS gateway status

