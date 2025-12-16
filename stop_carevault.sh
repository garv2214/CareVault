#!/bin/bash

# CareVault Stop Script
# Gracefully stops all CareVault services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}🛑 Stopping CareVault Services...${NC}"

# Kill processes by PID file if it exists
if [ -f ".carevault_pids" ]; then
    echo -e "${YELLOW}📋 Stopping services by PID...${NC}"
    while read -r pids; do
        for pid in $pids; do
            if ps -p "$pid" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Stopping process $pid${NC}"
                kill "$pid" 2>/dev/null || true
            fi
        done
    done < .carevault_pids
    rm -f .carevault_pids
fi

# Kill processes by pattern (fallback)
echo -e "${YELLOW}🔍 Stopping any remaining CareVault processes...${NC}"
pkill -f "hardhat node" 2>/dev/null || true
pkill -f "node.*index.js" 2>/dev/null || true
pkill -f "python.*ai_server.py" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true

# Force kill if graceful shutdown fails
sleep 2
pkill -9 -f "hardhat node" 2>/dev/null || true
pkill -9 -f "node.*index.js" 2>/dev/null || true
pkill -9 -f "python.*ai_server.py" 2>/dev/null || true
pkill -9 -f "npm.*start" 2>/dev/null || true

echo -e "${GREEN}✅ All CareVault services stopped${NC}"
echo -e "${BLUE}💡 To start again, run: ./START_SEQUENTIAL.sh${NC}"
