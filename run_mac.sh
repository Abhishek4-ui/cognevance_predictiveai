#!/bin/bash
# ========================================================
# PredictAI Pro - Unified MacBook Startup Script
# Optimized for Apple Silicon (M1/M2/M3/M4) and Intel Macs
# ========================================================

set -e

# Change directory to the script root
cd "$(dirname "$0")"

echo "=========================================================="
echo "    🚀 PREDICTAI PRO - LEVEL 3 PREDICTIVE ANALYTICS"
echo "=========================================================="

# Check Python virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Ensure OpenMP dylib for XGBoost on macOS Apple Silicon
if [ -f "/opt/homebrew/opt/libomp/lib/libomp.dylib" ] && [ ! -f "venv/lib/python3.14/site-packages/xgboost/lib/libomp.dylib" ]; then
    mkdir -p venv/lib/python3.14/site-packages/xgboost/lib/
    cp /opt/homebrew/opt/libomp/lib/libomp.dylib venv/lib/python3.14/site-packages/xgboost/lib/ 2>/dev/null || true
fi

# Trap to kill both background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down PredictAI Pro services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start FastAPI Backend
echo "Starting Backend API on http://127.0.0.1:8000..."
export PYTHONPATH=.
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for Backend to initialize..."
until curl -s http://127.0.0.1:8000/api/dashboard/health > /dev/null 2>&1; do
    sleep 0.5
done
echo "✅ Backend API online at http://127.0.0.1:8000 (Docs: http://127.0.0.1:8000/docs)"

# 2. Start Vite Frontend
echo "Starting React Frontend on http://127.0.0.1:5173..."
cd frontend
npm run dev -- --port 5173 --host &
FRONTEND_PID=$!
cd ..

echo "=========================================================="
echo "🎉 PredictAI Pro is running!"
echo "👉 Web Dashboard: http://127.0.0.1:5173"
echo "👉 REST API Docs:  http://127.0.0.1:8000/docs"
echo "👉 Admin Account:  admin / PredictAIAdmin2026!"
echo "=========================================================="
echo "Press CTRL+C anytime to stop all services."

# Wait indefinitely
wait
