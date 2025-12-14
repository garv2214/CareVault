# 🔧 Quick Fix: Backend Not Responding

## Problem
Backend process exists but isn't responding to requests.

## Solution: Restart Backend

### Step 1: Kill Old Process
```bash
# Find and kill backend process
lsof -ti:5000 | xargs kill -9
```

Or manually:
```bash
# Find the process
ps aux | grep "node index.js"

# Kill it (replace PID with actual process ID)
kill -9 <PID>
```

### Step 2: Start Fresh Backend
```bash
cd /Users/garvsharma/decentralized-health-records/backend
node index.js
```

You should see:
```
🚀 Backend listening on port 5000
```

### Step 3: Verify It Works
In another terminal:
```bash
curl http://localhost:5000/
```

Should return: `CareVault Backend Running 🚀`

### Step 4: Generate Records
Now run:
```bash
cd /Users/garvsharma/decentralized-health-records
npm run generate:records
```

---

## Alternative: Use Frontend Button

If backend keeps having issues, use the frontend button instead:

1. Make sure backend is running
2. Open browser to `http://localhost:3001`
3. Click "Generate 50 Records" button
4. Done!

---

## Why This Happens

- Backend might have crashed silently
- Port might be in use by another process
- Backend might be stuck waiting for blockchain/IPFS

**Solution:** Always restart backend fresh before generating records.

