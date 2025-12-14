# 🦊 MetaMask Setup Guide - Step by Step

Complete guide to install and connect MetaMask wallet in Chrome for CareVault.

---

## 📥 Step 1: Install MetaMask Extension

1. **Open Chrome** and go to the Chrome Web Store
   - Direct link: https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn
   - Or search "MetaMask" in Chrome Web Store

2. **Click "Add to Chrome"** button

3. **Click "Add Extension"** in the popup

4. **Wait for installation** - You'll see a MetaMask icon in your Chrome toolbar (top right)

---

## 🔐 Step 2: Create or Import Wallet

### Option A: Create New Wallet (Recommended for Testing)

1. **Click the MetaMask icon** in Chrome toolbar

2. **Click "Get Started"**

3. **Choose "Create a Wallet"**

4. **Set a password** (8+ characters)
   - ⚠️ This password unlocks MetaMask on this device
   - ⚠️ It does NOT recover your wallet if you lose your seed phrase

5. **Watch the security video** (optional but recommended)

6. **Reveal your Secret Recovery Phrase**
   - ⚠️ **CRITICAL**: Write down these 12 words in order
   - ⚠️ Store them securely - anyone with this phrase can access your wallet
   - ⚠️ Never share or screenshot your seed phrase

7. **Confirm your seed phrase** by selecting the words in order

8. **Click "All Done"**

### Option B: Import Existing Wallet

1. Click MetaMask icon → "Get Started"
2. Choose "Import Wallet"
3. Enter your Secret Recovery Phrase (12 words)
4. Set a password
5. Click "Import"

---

## 🏠 Step 3: Add Localhost Network

Since we're using a local Hardhat blockchain, you need to add it to MetaMask:

1. **Open MetaMask** (click the icon)

2. **Click the network dropdown** (top center, shows "Ethereum Mainnet" or similar)

3. **Click "Add Network"** or "Add a network manually"

4. **Enter these details:**
   ```
   Network Name: Hardhat Local
   RPC URL: http://127.0.0.1:8545
   Chain ID: 31337
   Currency Symbol: ETH
   Block Explorer URL: (leave empty)
   ```

5. **Click "Save"**

6. **Switch to "Hardhat Local"** network (select it from dropdown)

---

## 💰 Step 4: Import Test Account (For Local Development)

When you run `npx hardhat node`, you'll see test accounts with private keys.

1. **In MetaMask**, click the account icon (top right, circle with account)

2. **Click "Import Account"**

3. **Copy a private key** from your Hardhat terminal output
   - Look for: `Account #0: 0x... (PRIVATE_KEY)`
   - Copy the PRIVATE_KEY (starts with `0x`)

4. **Paste the private key** in MetaMask

5. **Click "Import"**

6. **You now have test ETH!** (Hardhat gives test accounts 10000 ETH)

---

## 🔗 Step 5: Connect to CareVault App

1. **Make sure your backend is running:**
   ```bash
   cd backend
   node index.js
   ```

2. **Make sure Hardhat node is running:**
   ```bash
   cd blockchain
   npx hardhat node
   ```

3. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

4. **Open browser** to `http://localhost:3000`

5. **Click "Connect Wallet"** button

6. **MetaMask popup will appear:**
   - Click "Next"
   - Click "Connect"

7. **You're connected!** 🎉

---

## ✅ Verification Checklist

- [ ] MetaMask extension installed
- [ ] Wallet created/imported
- [ ] Localhost network added (Chain ID: 31337)
- [ ] Switched to "Hardhat Local" network
- [ ] Test account imported with private key
- [ ] Connected to CareVault app
- [ ] Can see wallet address in top right of app

---

## 🆘 Troubleshooting

### "MetaMask not detected"
- Make sure MetaMask extension is installed
- Refresh the page
- Check if MetaMask is enabled in Chrome extensions

### "Wrong network"
- Switch to "Hardhat Local" network in MetaMask
- Make sure Hardhat node is running on port 8545

### "Insufficient funds"
- Import a test account from Hardhat
- Hardhat test accounts have 10000 ETH

### "Transaction failed"
- Check you're on the correct network
- Make sure contract is deployed
- Verify contract address in `.env` files

### "Can't connect to localhost"
- Make sure Hardhat node is running: `npx hardhat node`
- Check it's running on port 8545
- Try `http://localhost:8545` instead of `127.0.0.1:8545`

---

## 🔒 Security Tips

1. **Never share your seed phrase** with anyone
2. **Never enter seed phrase on any website**
3. **Use test accounts** for development (not real money)
4. **Don't use mainnet** for testing (use localhost or testnets)
5. **Keep your password secure** but remember it unlocks MetaMask locally

---

## 📚 Next Steps

After connecting:
- Go to **Patient Tab** to add health records
- Go to **Doctor Tab** to request access
- Go to **Emergency Tab** for emergency access

---

## 🎯 Quick Reference

**Network Settings:**
- Network Name: `Hardhat Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency: `ETH`

**Test Account:**
- Get from Hardhat output when running `npx hardhat node`
- Import using "Import Account" in MetaMask

**App URL:**
- `http://localhost:3000`

---

Need more help? Check `QUICK_GUIDE.md` for app setup instructions.

