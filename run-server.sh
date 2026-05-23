#!/bin/bash

# SoundSurf Server Startup Script
# This script installs dependencies and starts the Express backend server

set -e  # Exit on error

echo "🎵 SoundSurf Server Starting..."
echo ""

# Navigate to server directory
cd "$(dirname "$0")/server"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Check for .env file
if [ ! -f ".env" ]; then
  echo "⚠️  No .env file found. Creating default..."
  cat > .env << EOF
PORT=3001
NODE_ENV=development
EOF
  echo ""
fi

echo "🚀 Starting server on http://localhost:3001"
echo ""

# Start the server
npm run dev
