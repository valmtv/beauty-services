# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Copy root lock and package files for workspaces setup
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install workspaces dependencies for the backend, ignoring hooks/scripts (e.g. husky)
RUN npm ci --ignore-scripts --workspace=beauty-services-backend

# Copy backend tsconfig and source
COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src

# Compile backend
RUN npm run build --workspace=beauty-services-backend

# Stage 2: Runtime
FROM node:24-alpine

WORKDIR /app

# Copy root lock and package files for runtime setup
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install only production dependencies for the backend, ignoring hooks/scripts
RUN npm ci --omit=dev --ignore-scripts --workspace=beauty-services-backend

# Copy built code from the builder stage
COPY --from=builder /app/backend/dist ./backend/dist

# Standard backend API port
EXPOSE 3001

ENV NODE_ENV=production

# Run backend start command using workspaces
CMD ["npm", "start", "--workspace=beauty-services-backend"]
