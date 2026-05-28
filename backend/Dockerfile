# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci

# Copy tsconfig and source code
COPY tsconfig.json ./
COPY src ./src

# Build production distribution
RUN npm run build

# Stage 2: Runtime
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist

# Standard backend API port
EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
