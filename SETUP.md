# CareVault - Integrated Application Setup

## Architecture

```
Frontend (React) ──► Backend (Node.js/Express) ──► AI Service (Python/FastAPI)
       │                      │                           │
       └── ethers.js ──► Blockchain (Solidity)     Federated Learning
                              │
                           IPFS (encrypted records)
```

## Quick Start (4 terminals)

### Terminal 1: Blockchain
```bash
cd blockchain && npm install && npx hardhat compile
npx hardhat node
```

### Terminal 2: Deploy Contract
```bash
cd blockchain && npx hardhat run scripts/deploy.js --network localhost
# Copy contract address to backend/.env and frontend/.env
```

### Terminal 3: AI Service
```bash
cd ai && pip install -r requirements.txt
python3 ai_server.py
# Runs on http://localhost:8000
```

### Terminal 4: Backend
```bash
cd backend && npm install
# Create backend/.env (see below)
node index.js
# Runs on http://localhost:5000
```

### Terminal 5: Frontend
```bash
cd frontend && npm install && npm start
# Runs on http://localhost:3000
```

## Environment Variables

### backend/.env
```
PORT=5000
ETH_RPC_URL=http://127.0.0.1:8545
HEALTH_CONTRACT_ADDRESS=<from deploy output>
DEPLOYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d0ff2ffa8d012345c678d9cae9dfa4b7d5d98d12
AES_SECRET_KEY=01234567890123456789012345678901
AI_SERVICE_URL=http://localhost:8000
JWT_SECRET=carevault-dev-secret
```

### frontend/.env
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CONTRACT_ADDRESS=<from deploy output>
```

## API Modules

| Module | Base Path | Features |
|--------|-----------|----------|
| Auth | `/api/auth` | OTP send/verify, register, profile |
| Health | `/api/health` | Records, emergency, contacts, audit |
| Providers | `/api/providers` | Doctors, hospitals, slots, search |
| Appointments | `/api/appointments` | Book, cancel, schedule (atomic) |
| Content | `/api/content` | Medications, articles, notifications |
| AI | `/api/ai` | Predictions, classification, federated status |

## User Roles

- **Patient**: Records, appointments, medications, emergency SOS
- **Doctor**: Patient access, schedule, time slot management
- **Admin**: Directory management, hospitals, doctors

## OTP Login (Dev Mode)

OTP is logged to the backend console. Use the displayed code in the verification screen.
