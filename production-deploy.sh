#!/bin/bash

# Production deployment script for Manasik booking platform
# This script should be run on the production server at 46.101.13.38
# Usage: bash production-deploy.sh

set -e

echo "🚀 Starting Manasik production deployment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "This script must be run as root"
    exit 1
fi

DEPLOY_DIR="/var/www/manasik"

# Step 1: Update repository
print_section "Step 1: Updating repository from main branch"
cd "$DEPLOY_DIR"
git fetch origin main
git reset --hard origin/main
print_status "Repository updated to latest main branch"

# Step 2: Build and deploy backend service
print_section "Step 2: Building and deploying backend service"
cd "$DEPLOY_DIR/service"

print_info "Installing dependencies..."
npm ci
print_status "Dependencies installed"

print_info "Building service..."
npm run build
print_status "Service built successfully"

print_info "Running database migrations..."
npm run migrate:latest
print_status "Database migrations completed"

print_info "Restarting backend service with PM2..."
pm2 restart backend || pm2 start dist/server.js --name backend
print_status "Backend service restarted"

# Step 3: Build and deploy frontend
print_section "Step 3: Building and deploying frontend"
cd "$DEPLOY_DIR/frontend"

print_info "Installing dependencies..."
npm ci
print_status "Dependencies installed"

print_info "Building frontend..."
npm run build
print_status "Frontend built successfully"

print_info "Restarting frontend service with PM2..."
pm2 restart frontend || pm2 start npm --name frontend -- start
print_status "Frontend service restarted"

# Step 4: Build and deploy management panel
print_section "Step 4: Building and deploying management panel"
cd "$DEPLOY_DIR/management"

print_info "Installing dependencies..."
npm ci
print_status "Dependencies installed"

print_info "Building management panel..."
npm run build
print_status "Management panel built successfully"

print_info "Restarting management service with PM2..."
pm2 restart management || pm2 start npm --name management -- start
print_status "Management service restarted"

# Step 5: Verify services
print_section "Step 5: Verifying services"

sleep 5

print_info "Checking API health..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_status "API is healthy"
else
    print_error "API health check failed - check logs with: pm2 logs backend"
fi

print_info "Checking PM2 status..."
pm2 status

# Step 6: Save PM2 configuration
print_section "Step 6: Saving PM2 configuration"
pm2 save
print_status "PM2 configuration saved"

echo ""
echo -e "${GREEN}✨ Deployment complete!${NC}"
echo ""
echo "Services are now running at:"
echo "  API: http://46.101.13.38:3001"
echo "  Frontend: http://46.101.13.38:3000"
echo "  Management: http://46.101.13.38:3002"
echo ""
echo "Useful commands:"
echo "  View logs: pm2 logs"
echo "  View specific service: pm2 logs backend"
echo "  Restart service: pm2 restart backend"
echo "  Stop all: pm2 stop all"
echo "  Start all: pm2 start all"
echo ""
