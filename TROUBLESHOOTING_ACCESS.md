# 🚨 Troubleshooting: Application Not Accessible

## 🔍 Why Your Application Might Not Be Accessible

### **Common Issues & Solutions**

## 1. **Port Conflicts**
**Problem**: Another application is using the same port
**Solution**:
```bash
# Check what's using each port
lsof -i :3000  # Frontend port
lsof -i :7000  # Backend port  
lsof -i :8000  # AI Service port
lsof -i :8545  # Blockchain port

# Kill the process if needed
kill -9 <PID>
```

## 2. **Services Starting Too Fast**
**Problem**: The original `start_all.sh` runs all services simultaneously
**Solution**: Use the new sequential startup:
```bash
chmod +x START_SEQUENTIAL.sh stop_carevault.sh
./START_SEQUENTIAL.sh
```

## 3. **Missing Dependencies**
**Problem**: Node.js or Python dependencies not installed
**Solution**:
```bash
# Install Node.js dependencies
npm run install:all

# Install Python dependencies
cd ai && pip install -r requirements.txt && cd ..
```

## 4. **Firewall/Security Settings**
**Problem**: macOS firewall blocking connections
**Solution**:
- Go to System Preferences → Security & Privacy → Firewall
- Add exceptions for Node.js, Python, and your browser
- Or temporarily disable firewall for testing

## 5. **Node.js Version Issues**
**Problem**: Incompatible Node.js version
**Solution**:
```bash
# Check your Node.js version
node --version

# Should be v16.0.0 or higher
# Download from https://nodejs.org if needed
```

## 6. **Browser Cache**
**Problem**: Old cached versions causing conflicts
**Solution**:
- Hard refresh browser (Cmd+Shift+R)
- Clear browser cache
- Try incognito/private mode
- Try different browser (Chrome, Firefox, Safari)

## 7. **IPFS Connection Issues**
**Problem**: IPFS service not starting properly
**Solution**:
```bash
# Check IPFS status
ipfs --version

# If not installed, install it:
# brew install ipfs  (macOS)
```

## 🛠️ **Step-by-Step Troubleshooting**

### Step 1: Clean Restart
```bash
# Stop any existing services
./stop_carevault.sh

# Clear any cached data
rm -rf node_modules/.cache
rm -rf frontend/node_modules/.cache

# Start fresh
./START_SEQUENTIAL.sh
```

### Step 2: Check Individual Services
```bash
# Test each service separately:
curl http://localhost:7000     # Backend
curl http://localhost:8000     # AI Service  
curl http://localhost:8545     # Blockchain
curl http://localhost:3000     # Frontend
```

### Step 3: Check Logs
```bash
# View service logs
tail -f logs/backend.log
tail -f logs/ai.log
tail -f logs/blockchain.log
tail -f logs/frontend.log
```

### Step 4: Check Process Status
```bash
# See all CareVault processes
ps aux | grep -E "(hardhat|node|python)" | grep -v grep
```

## 🎯 **Expected Startup Sequence**

When using `START_SEQUENTIAL.sh`, you should see:

1. ✅ **Prerequisites Check** - Node.js, Python versions
2. ✅ **Dependencies Installation** - npm packages, Python packages  
3. ✅ **Port Availability Check** - All ports free
4. ✅ **Blockchain Start** - Hardhat local network
5. ✅ **Contract Deployment** - Smart contract to blockchain
6. ✅ **AI Service Start** - Flask server on port 8000
7. ✅ **Backend Start** - Express server on port 7000
8. ✅ **Frontend Start** - React dev server on port 3000

**Total Time**: 2-3 minutes for complete startup

## 🌐 **Access URLs After Successful Startup**

- **Main Application**: http://localhost:3000
- **Backend API**: http://localhost:7000
- **AI Service**: http://localhost:8000
- **Blockchain**: http://localhost:8545

## 🔧 **Quick Fix Commands**

If you're still having issues:

```bash
# Nuclear option - restart everything
./stop_carevault.sh
sleep 5
./START_SEQUENTIAL.sh
```

## 📞 **Need More Help?**

If none of these solutions work:

1. **Check the console output** when running the startup script
2. **Note any error messages** you see
3. **Try the manual startup** method described below

## 🔄 **Manual Startup (Fallback Method)**

If scripts fail, start services manually:

**Terminal 1 - Blockchain:**
```bash
cd blockchain
npx hardhat node
```

**Terminal 2 - Deploy Contract:**
```bash
cd blockchain  
npx hardhat run scripts/deploy.js --network localhost
```

**Terminal 3 - AI Service:**
```bash
cd ai
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python ai_server.py
```

**Terminal 4 - Backend:**
```bash
cd backend
npm install
node index.js
```

**Terminal 5 - Frontend:**
```bash
cd frontend
npm install  
npm start
```

This ensures each service starts properly and you can see any errors directly in the terminal.
