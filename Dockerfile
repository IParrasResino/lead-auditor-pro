# Multi-stage build: Node.js + Python 3 runtime for Lead Auditor Pro

# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install Python 3 and build tools
RUN apk add --no-cache python3 py3-pip python3-dev build-base

# Install pnpm version compatible with packageManager
RUN npm install -g pnpm@10.4.1

# Copy package files and patches BEFORE pnpm install
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install Node dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build frontend and backend
RUN pnpm build


# Stage 2: Runtime stage
FROM node:22-alpine

WORKDIR /app

# Install Python 3, pip, and runtime build tools
RUN apk add --no-cache python3 py3-pip python3-dev build-base

# Copy built artifacts and dependencies from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy Python pipeline
COPY python_pipeline ./python_pipeline

# Setup Python virtual environment and install dependencies
RUN cd python_pipeline && \
    python3 -m venv .venv && \
    .venv/bin/python -m pip install --upgrade pip && \
    .venv/bin/python -m pip install -r requirements.txt && \
    cd ..

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["node", "dist/index.js"]