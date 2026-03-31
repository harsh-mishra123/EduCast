#!/bin/bash

SERVICE=$1

if [ -z "$SERVICE" ]; then
  echo "Usage: ./scripts/start-service.sh <service-name>"
  echo "Available services: auth, class, payment, video, chat, notification, media, signaling, recording, gateway"
  exit 1
fi

echo "Starting $SERVICE-service..."
node src/services/$SERVICE/server.js