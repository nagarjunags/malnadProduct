cd ~/malnadProduct/apps/backend
cp .env .medusa/server/.env
cd .medusa/server
pkill -f "medusa start" 2>/dev/null || true
NODE_ENV=production nohup npm start > ~/medusa.log 2>&1 &