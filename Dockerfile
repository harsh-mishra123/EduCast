# Multi-stage build for all services
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Final stage
FROM node:20-alpine

WORKDIR /app

# Install ffmpeg for video processing services
RUN apk add --no-cache ffmpeg

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy source code
COPY . .

# Service to run (passed via build arg)
ARG SERVICE
ENV SERVICE=$SERVICE

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port (will be overridden by runtime)
EXPOSE 3000-3010 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT:-3000}/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Run the service
CMD ["sh", "-c", "node src/services/${SERVICE}/server.js"]