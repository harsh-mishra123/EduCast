#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

SERVICES=("auth" "class" "payment" "video" "chat" "notification" "media" "signaling" "recording" "gateway")
PORTS=(3001 3002 3003 3004 3005 3006 3007 3008 3009 8000)

echo "Running health checks..."

for i in "${!SERVICES[@]}"; do
  SERVICE="${SERVICES[$i]}"
  PORT="${PORTS[$i]}"
  
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/health)
  
  if [ "$RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✓ $SERVICE-service is healthy (port $PORT)${NC}"
  else
    echo -e "${RED}✗ $SERVICE-service is NOT healthy (port $PORT, status $RESPONSE)${NC}"
  fi
done