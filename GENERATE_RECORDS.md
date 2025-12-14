# 🚀 Auto-Generate Health Records

You can automatically generate 50 (or any number) of test health records instead of entering them manually!

---

## 🎯 Method 1: Frontend Button (Easiest!)

1. **Open your CareVault app** (`http://localhost:3001`)
2. **Go to Patient Dashboard**
3. **Click the green "Generate 50 Records" button** (next to "Add New Record")
4. **Confirm** when prompted
5. **Wait** - It will generate 50 records automatically
6. **Refresh the page** to see all records!

**That's it!** No coding needed. 🎉

---

## 🖥️ Method 2: Command Line Script

From the **root directory**, run:

```bash
# Generate 50 records (default)
npm run generate:records

# Generate 10 records
npm run generate:records:10

# Generate 50 records
npm run generate:records:50

# Generate 100 records
npm run generate:records:100

# Custom number
node backend/scripts/generateRecords.js 25
```

**Make sure backend is running first!**

---

## 📋 What Gets Generated?

Each record includes:
- **Patient ID**: `patient-001`, `patient-002`, etc.
- **Random age**: 20-80 years
- **Random vitals**: Blood pressure, heart rate, temperature, blood sugar
- **Random symptoms**: From a list of common symptoms
- **Random diagnosis**: From a list of common diagnoses
- **Timestamp**: Current date/time

---

## ✅ Requirements

Before generating records:

1. ✅ **Backend is running**
   ```bash
   cd backend
   node index.js
   ```

2. ✅ **Blockchain node is running**
   ```bash
   npm run start:blockchain
   ```

3. ✅ **Contract is deployed**
   ```bash
   npm run deploy:local
   ```

4. ✅ **Contract address in `.env` files**
   - `backend/.env`: `HEALTH_CONTRACT_ADDRESS=0x...`
   - `frontend/.env`: `REACT_APP_CONTRACT_ADDRESS=0x...`

---

## 🎨 Frontend Button Details

The "Generate 50 Records" button:
- ✅ Generates records automatically
- ✅ Shows progress
- ✅ Displays success/failure count
- ✅ Refreshes the records list
- ✅ Works without any coding!

---

## 🔧 Customize Generated Data

To change what gets generated, edit:
- `backend/scripts/generateRecords.js` - For command line script
- `frontend/src/components/PatientDashboard.jsx` - For frontend button

You can modify:
- Age ranges
- Symptom lists
- Diagnosis options
- Vitals ranges

---

## 📊 Example Output

After generating, you'll see:
```
✅ Generated 50 records successfully!
Refresh to see them!
```

In the Patient Dashboard, you'll see:
- `patient-001` through `patient-050`
- Each with unique health data
- All stored on IPFS and blockchain!

---

## 🆘 Troubleshooting

### "Cannot connect to backend"
- Make sure backend is running: `cd backend && node index.js`
- Check it's on port 5000

### "Transaction failed"
- Check blockchain node is running
- Verify contract is deployed
- Check contract address in `.env` files

### "Some records failed"
- This is normal if blockchain is slow
- Check backend terminal for errors
- Try generating fewer records at once

---

## 💡 Tips

- **Start with 10 records** to test: `npm run generate:records:10`
- **Use frontend button** for easiest experience
- **Check browser console** for any errors
- **Refresh page** after generating to see records

---

## 🎉 Success!

After generating, you can:
- ✅ View all records in Patient Dashboard
- ✅ Test Doctor access with any Patient ID
- ✅ Test Emergency access
- ✅ See AI risk predictions for each record

**Enjoy your test data!** 🏥

