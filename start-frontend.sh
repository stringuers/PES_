#!/bin/bash

echo " Solar Swarm Intelligence - Frontend Startup"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo " Error: frontend directory not found"
    echo "Please run this script from the project root"
    exit 1
fi

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo " Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo " Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
    echo ""
fi

# Check if .env exists, if not copy from example
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo " Creating .env file from .env.example..."
        cp .env.example .env
        echo " .env file created"
        echo ""
    fi
fi

echo " Starting development server..."
echo ""
echo "Frontend will be available at: http://localhost:3000"
echo "Make sure the backend is running at: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
