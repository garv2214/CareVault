# 🆘 Troubleshooting Guide

## "Failed to catch" or "Failed to add record" Error

### Quick Fix Checklist

1. ✅ **Backend is running?**
   ```bash
   cd backend
   node index.js
   ```
   Should see: `🚀 Backend listening on port 5000`

2. ✅ **Check backend URL**
   - Frontend expects: `http://localhost:5000/api`
   - Check `frontend/.env`: `REACT_APP_API_URL=http://localhost:5000/api`

3. ✅ **CORS enabled?**
   - Backend should have CORS enabled (already configured)

4. ✅ **Check browser console**
   - Open DevTools (F12)
   - Look for error messages in Console tab
   - Check Network tab for failed requests

---

## Common Errors & Solutions

### Error: "Cannot connect to backend"

**Cause:** Backend server not running

**Solution:**
```bash
cd backend
node index.js
```

**Verify:**
```bash
curl http://localhost:5000/
# Should return: "CareVault Backend Running 🚀"
```

---

### Error: "NetworkError" or "Failed to fetch"

**Cause:** Backend not accessible or wrong URL

**Solutions:**
1. Check backend is running on port 5000
2. Verify `frontend/.env` has correct API URL
3. Check for firewall blocking port 5000
4. Try accessing `http://localhost:5000/api/health` in browser

---

### Error: "Contract not found" or "Transaction failed"

**Cause:** Smart contract not deployed or wrong address

**Solutions:**
1. Deploy contract: `npm run deploy:local`
2. Copy contract address
3. Update `backend/.env`: `HEALTH_CONTRACT_ADDRESS=0x...`
4. Update `frontend/.env`: `REACT_APP_CONTRACT_ADDRESS=0x...`
5. Restart both backend and frontend

---

### Error: "IPFS client initialization failed"

**Cause:** IPFS not available (this is OK for testing)

**Solution:**
- This is a warning, not an error
- Records will be stored locally
- For production, set up IPFS or use Infura

---

### Error: "AI service unavailable"

**Cause:** AI service not running

**Solution:**
```bash
cd ai
source venv/bin/activate
python ai_server.py
```

**Verify:**
```bash
curl http://localhost:8000/
# Should return: "AI service running"
```

---

## Step-by-Step Debugging

### 1. Check All Services Are Running

**Terminal 1 - Blockchain:**
```bash
cd blockchain
npx hardhat node
```
✅ Should see: "Started HTTP and WebSocket JSON-RPC server"

**Terminal 2 - Backend:**
```bash
cd backend
node index.js
```
✅ Should see: "🚀 Backend listening on port 5000"

**Terminal 3 - AI Service:**
```bash
cd ai
source venv/bin/activate
python ai_server.py
```
✅ Should see: "AI service running" or "Running on http://127.0.0.1:8000"

**Terminal 4 - Frontend:**
```bash
cd frontend
npm start
```
✅ Should open browser to `http://localhost:3000` or `3001`

---

### 2. Test Backend Endpoints

```bash
# Test root endpoint
curl http://localhost:5000/

# Test health endpoint
curl http://localhost:5000/api/health

# Test adding a record
curl -X POST http://localhost:5000/api/health \
  -H "Content-Type: application/json" \
  -d '{"patientId":"test-001","recordData":{"age":30}}'
```

---

### 3. Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for red error messages
4. Go to **Network** tab
5. Try submitting record
6. Check if request to `/api/health` failed

---

### 4. Check Environment Variables

**Backend `.env`:**
```bash
cd backend
cat .env
```
Should have:
- `HEALTH_CONTRACT_ADDRESS=0x...`
- `ETH_RPC_URL=http://127.0.0.1:8545`
- `PORT=5000`

**Frontend `.env`:**
```bash
cd frontend
cat .env
```
Should have:
- `REACT_APP_API_URL=http://localhost:5000/api`
- `REACT_APP_CONTRACT_ADDRESS=0x...`

---

## Quick Fixes

### Restart Everything

```bash
# Kill all node processes
pkill -f node
pkill -f python

# Restart in order:
# 1. Blockchain
cd blockchain && npx hardhat node &

# 2. Backend
cd backend && node index.js &

# 3. AI Service
cd ai && source venv/bin/activate && python ai_server.py &

# 4. Frontend
cd frontend && npm start
```

---

### Clear Browser Cache

1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

---

### Check Port Conflicts

```bash
# Check what's using port 5000
lsof -ti:5000

# Check what's using port 3000
lsof -ti:3000

# Kill process if needed
kill -9 <PID>
```

---

## Still Not Working?

1. **Check all terminals** for error messages
2. **Check browser console** for JavaScript errors
3. **Verify all .env files** are configured
4. **Make sure contract is deployed**
5. **Try restarting everything** in order

---

## Get Help

If still stuck, check:
- Backend terminal output
- Browser console errors
- Network tab in DevTools
- All services are running
- Environment variables are set

