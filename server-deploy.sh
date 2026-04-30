#!/bin/bash

# Automated deployment script for Manasik booking platform
# Run this script on the production server: bash server-deploy.sh

set -e

echo "🚀 Starting Manasik deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "This script must be run as root"
    exit 1
fi

DEPLOY_DIR="/root/manasik"

# Step 1: Clone or update repository
print_info "Step 1: Cloning/updating repository..."
if [ -d "$DEPLOY_DIR" ]; then
    cd "$DEPLOY_DIR"
    git pull origin main
    print_status "Repository updated"
else
    git clone https://github.com/yourusername/manasik.git "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
    print_status "Repository cloned"
fi

# Step 2: Install dependencies
print_info "Step 2: Installing dependencies..."
cd "$DEPLOY_DIR/service"
npm install --production
print_status "Service dependencies installed"

cd "$DEPLOY_DIR/frontend"
npm install --production
print_status "Frontend dependencies installed"

cd "$DEPLOY_DIR/management"
npm install --production
print_status "Management dependencies installed"

# Step 3: Build services
print_info "Step 3: Building services..."
cd "$DEPLOY_DIR/service"
npm run build
print_status "Service built"

# Step 4: Run database migrations
print_info "Step 4: Running database migrations..."
cd "$DEPLOY_DIR/service"
npm run migrate:latest
print_status "Database migrations completed"

# Step 5: Build Docker images
print_info "Step 5: Building Docker images..."
cd "$DEPLOY_DIR"

docker build -t manasik-api service/
print_status "API image built"

docker build -t manasik-frontend frontend/
print_status "Frontend image built"

docker build -t manasik-management management/
print_status "Management image built"

# Step 6: Stop existing containers
print_info "Step 6: Stopping existing containers..."
docker-compose -f docker-compose.yml down || true
print_status "Existing containers stopped"

# Step 7: Start services
print_info "Step 7: Starting services..."
docker-compose -f docker-compose.yml up -d
print_status "Services started"

# Step 8: Wait for services to be healthy
print_info "Step 8: Waiting for services to be healthy..."
sleep 10

# Step 9: Verify services
print_info "Step 9: Verifying services..."

# Check API
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_status "API is healthy"
else
    print_error "API health check failed"
fi

# Check containers
print_info "Container status:"
docker-compose ps

echo ""
echo -e "${GREEN}✨ Deployment complete!${NC}"
echo ""
echo "Services are now running at:"
echo "  API: http://46.101.13.38:3001"
echo "  Frontend: http://46.101.13.38:3000"
echo "  Management: http://46.101.13.38:3002"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop services:"
echo "  docker-compose down"
