#!/bin/bash
# Start Solar Swarm Intelligence locally (without Docker)

echo "🚀 Starting Solar Swarm Intelligence..."
echo ""

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source .venv/bin/activate

# Install dependencies if needed
if [ ! -f ".venv/.deps_installed" ]; then
    echo "📥 Installing Python dependencies..."
    pip install -r requirements.api.txt
    touch .venv/.deps_installed
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 To start the application:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   cd /Users/kilanimoemen/Desktop/PES"
echo "   source .venv/bin/activate"
echo "   python main.py api"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   cd /Users/kilanimoemen/Desktop/PES/frontend"
echo "   npm run dev"
echo ""
echo "   Then open:"
echo "   - Backend API: http://localhost:8000/docs"
echo "   - Frontend UI: http://localhost:3000"
echo ""



