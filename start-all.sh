#!/bin/bash

# Start Hardhat blockchain node
echo "Starting Hardhat node..."
cd blockchain
npx hardhat node &
BLOCKCHAIN_PID=$!
cd ..

# Start backend on port 6000
echo "Starting backend..."
cd backend
PORT=6000 node index.js &
BACKEND_PID=$!
cd ..

# Start frontend
echo "Starting frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "======================================"
echo "All services are running:"
echo "Hardhat node PID: $BLOCKCHAIN_PID"
echo "Backend PID: $BACKEND_PID  (PORT=6000)"
echo "Frontend PID: $FRONTEND_PID"
echo "======================================"
echo ""
echo "To stop everything: run 'pkill -f start-all.sh' or manually kill PIDs."
