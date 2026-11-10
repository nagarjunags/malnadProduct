#!/bin/bash

# Run this script ON the GCP server

cd ~/malnadProduct/apps/backend

# Stop existing server if running
if [ -f backend.pid ]; then
    echo "Stopping existing server..."
    kill $(cat backend.pid) 2>/dev/null || true
    rm backend.pid
fi

# Start the server
echo "Starting Medusa backend..."
NODE_ENV=production nohup npm start > ~/medusa.log 2>&1 &
echo $! > backend.pid

echo "✅ Server started with PID: $(cat backend.pid)"
echo ""
echo "View logs:"
echo "  tail -f ~/medusa.log"
echo ""
echo "Check status:"
echo "  ps -p \$(cat ~/malnadProduct/apps/backend/backend.pid)"
echo ""
echo "Stop server:"
echo "  kill \$(cat ~/malnadProduct/apps/backend/backend.pid)"
