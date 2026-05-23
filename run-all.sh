#!/bin/bash

# SoundSurf Full Stack Startup Script
# This script starts both the server and client in the background

echo "🎵 Starting SoundSurf..."
echo ""

PROJECT_ROOT="$(dirname "$0")"

# Check if scripts are executable
if [ ! -x "$PROJECT_ROOT/run-server.sh" ]; then
  chmod +x "$PROJECT_ROOT/run-server.sh"
fi

if [ ! -x "$PROJECT_ROOT/run-client.sh" ]; then
  chmod +x "$PROJECT_ROOT/run-client.sh"
fi

echo "📡 Starting Backend Server..."
"$PROJECT_ROOT/run-server.sh" &
SERVER_PID=$!

sleep 3

echo ""
echo "🎨 Starting Frontend Client..."
"$PROJECT_ROOT/run-client.sh" &
CLIENT_PID=$!

echo ""
echo "✅ SoundSurf is running!"
echo "   🖥️  Frontend:  http://localhost:5173"
echo "   📡 Backend:  http://localhost:3001"
echo ""
echo "   Press Ctrl+C to stop all services"
echo ""

# Wait for both processes
wait $SERVER_PID $CLIENT_PID
