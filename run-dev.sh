#!/bin/bash

# Finite Automaton Visualizer - Development Server Launcher
# This script runs both backend and frontend servers

echo "🚀 Starting Finite Automaton Visualizer..."
echo ""

# Check if backend is buildable
echo "📦 Building backend..."
if ! cargo build; then
    echo "❌ Backend build failed!"
    exit 1
fi

echo "✅ Backend built successfully"
echo ""

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    echo "✅ Frontend dependencies installed"
    echo ""
fi

# Start backend in background
echo "🔧 Starting backend server on http://127.0.0.1:8080..."
cargo run &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend in background
echo "🎨 Starting frontend server on http://localhost:5173..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers are running!"
echo ""
echo "📍 Backend:  http://127.0.0.1:8080"
echo "📍 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Trap Ctrl+C and kill both processes
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# Wait for processes
wait
