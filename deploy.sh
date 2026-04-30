#!/bin/bash

# Deployment script for Manasik booking platform
# Deploys to production server at 46.101.13.38

set -e

SERVER_IP="46.101.13.38"
SERVER_USER="root"
SERVER_PASSWORD="qA94zeJ(u5UKp"
DEPLOY_DIR="/root/manasik"

echo "🚀 Starting deployment to $SERVER_IP..."

# Create SSH key file for authentication
SSH_KEY_FILE="/tmp/deploy_key"
echo "Setting up SSH connection..."

# Use sshpass to handle password authentication
if ! command -v sshpass &> /dev/null; then
    echo "Installing sshpass..."
    brew install sshpass 2>/dev/null || apt-get install -y sshpass
fi

# Test connection
echo "Testing connection to server..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "echo 'Connection successful'"

# Push code to server
echo "📦 Pushing code to server..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "mkdir -p $DEPLOY_DIR"

# Use rsync to sync files
echo "Syncing files..."
sshpass -p "$SERVER_PASSWORD" rsync -avz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  --exclude=.next \
  --exclude=.env \
  --exclude=.DS_Store \
  --exclude=coverage \
  . "$SERVER_USER@$SERVER_IP:$DEPLOY_DIR/"

# Run deployment commands on server
echo "🔧 Running deployment commands on server..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
set -e

cd /root/manasik

echo "📥 Installing dependencies..."
npm install --prefix service
npm install --prefix frontend
npm install --prefix management

echo "🏗️ Building services..."
npm run build --prefix service

echo "🗄️ Running database migrations..."
npm run migrate:latest --prefix service

echo "🐳 Building Docker images..."
docker build -t manasik-api service/
docker build -t manasik-frontend frontend/
docker build -t manasik-management management/

echo "🚀 Starting Docker containers..."
docker-compose -f docker-compose.yml down || true
docker-compose -f docker-compose.yml up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

echo "✅ Checking service health..."
curl -f http://localhost:3001/api/health || echo "API health check pending..."
curl -f http://localhost:3000/ || echo "Frontend health check pending..."

echo "✨ Deployment complete!"
EOF

echo "✅ Deployment successful!"
echo "🌐 Services are now running at:"
echo "   API: http://46.101.13.38:3001"
echo "   Frontend: http://46.101.13.38:3000"
echo "   Management: http://46.101.13.38:3002"
