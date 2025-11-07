#!/bin/bash

# Start backend on port 3001 in background
echo "🚀 Starting backend server on port 3001..."
cd backend
node server.js &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 5

# Start frontend dev server on port 5000
echo "🎨 Starting frontend dev server on port 5000..."
cd ../frontend
PORT=5000 BROWSER=none npm start &
FRONTEND_PID=$!

echo "✅ Both servers started!"
echo "   Backend: http://localhost:3001"
echo "   Frontend: http://localhost:5000"

# Keep script running and wait for both processes
wait $BACKEND_PID $FRONTEND_PID
