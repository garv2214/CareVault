# 🚀 Start Backend Server

## Quick Start

The backend needs to be running before you can generate records.

### Step 1: Start Backend

Open a **new terminal** and run:

```bash
cd /Users/garvsharma/decentralized-health-records/backend
node index.js
```

You should see:
```
🚀 Backend listening on port 5000
```

**Keep this terminal open!**

---

### Step 2: Verify Backend is Running

In another terminal, test it:

```bash
curl http://localhost:5000/
```

Should return: `CareVault Backend Running 🚀`

---

### Step 3: Now Generate Records

Once backend is running, in another terminal:

```bash
cd /Users/garvsharma/decentralized-health-records
npm run generate:records
```

---

## All Services Checklist

Make sure you have these running:

1. ✅ **Blockchain** (Terminal 1):
   ```bash
   npm run start:blockchain
   ```

2. ✅ **Backend** (Terminal 2):
   ```bash
   cd backend && node index.js
   ```

3. ✅ **AI Service** (Terminal 3 - Optional):
   ```bash
   cd ai && source venv/bin/activate && python ai_server.py
   ```

4. ✅ **Frontend** (Terminal 4):
   ```bash
   npm run start:frontend
   ```

---

## Quick Fix

**Right now, just run:**

```bash
cd /Users/garvsharma/decentralized-health-records/backend
node index.js
```

Then in another terminal, run:
```bash
cd /Users/garvsharma/decentralized-health-records
npm run generate:records
```

