#!/bin/bash
# Deployment Script for Solar Swarm Intelligence
# Deploys the application using Docker

set -e

echo "=========================================="
echo "🚀 SOLAR SWARM INTELLIGENCE DEPLOYMENT"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose found${NC}"

# Build images
echo ""
echo "📦 Building Docker images..."
docker-compose build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Images built successfully${NC}"
else
    echo -e "${RED}❌ Image build failed${NC}"
    exit 1
fi

# Start services
echo ""
echo "🚀 Starting services..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Services started successfully${NC}"
else
    echo -e "${RED}❌ Failed to start services${NC}"
    exit 1
fi

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check API health
echo ""
echo "🔍 Checking API health..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  API health check failed (may still be starting)${NC}"
fi

# Display status
echo ""
echo "=========================================="
echo "📊 DEPLOYMENT STATUS"
echo "=========================================="
docker-compose ps

echo ""
echo "=========================================="
echo "🌐 ACCESS POINTS"
echo "=========================================="
echo "API Server:     http://localhost:8000"
echo "API Docs:       http://localhost:8000/docs"
echo "Frontend:       http://localhost:3000"
echo "=========================================="

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Commands:"
echo "  View logs:    docker-compose logs -f"
echo "  Stop:         docker-compose stop"
echo "  Restart:      docker-compose restart"
echo "  Remove:       docker-compose down"
echo ""
