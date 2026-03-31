#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting ClassCast Backend Development Environment${NC}"

# Start infrastructure with Docker
echo -e "${GREEN}Starting MongoDB, Redis, RabbitMQ, MinIO...${NC}"
docker-compose up -d

# Wait for services to be ready
sleep 5

# Start API Gateway
echo -e "${GREEN}Starting API Gateway on port 8000...${NC}"
nodemon src/gateway/server.js &

# Start all services
echo -e "${GREEN}Starting all microservices...${NC}"
nodemon src/services/auth/server.js &
nodemon src/services/class/server.js &
nodemon src/services/payment/server.js &
nodemon src/services/video/server.js &
nodemon src/services/chat/server.js &
nodemon src/services/notification/server.js &
nodemon src/services/media/server.js &
nodemon src/services/signaling/server.js &
nodemon src/services/recording/server.js &

echo -e "${BLUE}All services started! Press Ctrl+C to stop${NC}"

# Wait for all background processes
wait