#!/bin/bash

# Script to start Redis for local development
# This script loads the REDIS_PASSWORD from .env and starts Docker Compose

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Redis for local development...${NC}"

# Find Docker executable
if command -v docker &> /dev/null; then
    DOCKER_CMD="docker"
elif [ -f "/usr/local/bin/docker" ]; then
    DOCKER_CMD="/usr/local/bin/docker"
elif [ -f "/Applications/Docker.app/Contents/Resources/bin/docker" ]; then
    DOCKER_CMD="/Applications/Docker.app/Contents/Resources/bin/docker"
else
    # Try to find Docker app dynamically
    echo -e "${YELLOW}🔍 Docker not found in PATH or standard locations. Searching with Spotlight...${NC}"
    DOCKER_APP_PATH=$(mdfind "kMDItemCFBundleIdentifier == 'com.docker.docker'" | head -n 1)
    if [ -n "$DOCKER_APP_PATH" ] && [ -f "$DOCKER_APP_PATH/Contents/Resources/bin/docker" ]; then
        DOCKER_CMD="$DOCKER_APP_PATH/Contents/Resources/bin/docker"
        echo -e "${GREEN}✅ Found Docker at: $DOCKER_CMD${NC}"
    else
        echo -e "${RED}❌ Docker executable not found. Please install Docker Desktop or ensure it's in your PATH.${NC}"
        exit 1
    fi
fi


# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}📝 Please update REDIS_PASSWORD in .env file${NC}"
    else
        echo -e "${RED}❌ .env.example not found. Please create .env manually.${NC}"
        exit 1
    fi
fi

# Load environment variables from .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Check if REDIS_PASSWORD is set
if [ -z "$REDIS_PASSWORD" ]; then
    echo -e "${YELLOW}⚠️  REDIS_PASSWORD is not set in .env${NC}"
    echo -e "${YELLOW}Using default password: local_dev_password${NC}"
    export REDIS_PASSWORD="local_dev_password"
fi

# Check if Docker is running
if ! "$DOCKER_CMD" info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

# Start Docker Compose
echo -e "${GREEN}🐳 Starting Docker Compose...${NC}"
"$DOCKER_CMD" compose up -d

# Wait for Redis to be ready
echo -e "${GREEN}⏳ Waiting for Redis to be ready...${NC}"
sleep 2

# Check if Redis is running
if "$DOCKER_CMD" compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Redis is running!${NC}"
    echo ""
    echo -e "${GREEN}Connection details:${NC}"
    echo -e "  Host: ${REDIS_HOST:-localhost}"
    echo -e "  Port: ${REDIS_PORT:-6379}"
    echo -e "  Password: ${REDIS_PASSWORD}"
    echo ""
    echo -e "${GREEN}To verify, run:${NC}"
    echo -e "  docker compose ps"
    echo ""
    echo -e "${GREEN}To stop Redis, run:${NC}"
    echo -e "  docker compose down"
else
    echo -e "${RED}❌ Failed to start Redis. Check Docker logs:${NC}"
    echo -e "  docker compose logs"
    exit 1
fi
