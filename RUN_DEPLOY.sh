#!/bin/bash

# Run this to deploy - Copy and paste each section

echo "🚀 CareVault Deployment - Run These Commands"
echo "=============================================="
echo ""

echo "✅ Step 1: Login to Vercel"
echo "   vercel login"
echo ""

echo "✅ Step 2: Deploy Frontend"
echo "   cd frontend"
echo "   vercel --prod"
echo ""

echo "✅ Step 3: Set Environment Variables in Vercel Dashboard"
echo "   Go to: https://vercel.com/dashboard"
echo "   Select your project"
echo "   Settings → Environment Variables"
echo "   Add:"
echo "     REACT_APP_API_URL=https://your-backend.railway.app/api"
echo "     REACT_APP_CONTRACT_ADDRESS=0x... (your contract address)"
echo ""

echo "✅ Step 4: Redeploy"
echo "   vercel --prod"
echo ""

echo "=============================================="
echo "Ready to run? Copy the commands above!"

