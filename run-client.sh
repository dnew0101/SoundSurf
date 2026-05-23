#!/bin/bash

# SoundSurf Client Startup Script
# This script installs dependencies and starts the Vite dev server

set -e  # Exit on error

echo "🎵 SoundSurf Client Starting..."
echo ""

# Navigate to client directory
cd "$(dirname "$0")/client"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

echo "🚀 Starting client on http://localhost:5173"
echo ""

# Start the client
npm run dev
