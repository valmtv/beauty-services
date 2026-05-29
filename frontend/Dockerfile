# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Copy root lock and package files for workspaces setup
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install workspaces dependencies for the frontend, ignoring hooks/scripts (e.g. husky)
RUN npm ci --ignore-scripts --workspace=frontend

# Copy frontend config and source
COPY frontend/tsconfig.json ./frontend/
COPY frontend/next.config.ts ./frontend/
COPY frontend/eslint.config.mjs ./frontend/
COPY frontend/postcss.config.mjs ./frontend/
COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public

# Compile frontend
ENV NEXT_PUBLIC_API_URL=http://localhost:3001
RUN npm run build --workspace=frontend

# Stage 2: Runtime
FROM node:24-alpine

WORKDIR /app

# Copy root lock and package files for runtime setup
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install only production dependencies for the frontend
RUN npm ci --omit=dev --ignore-scripts --workspace=frontend

# Copy built code and public assets
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/next.config.ts ./frontend/next.config.ts

# Standard Next.js port
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://localhost:3001

# Run frontend start command using workspaces
CMD ["npm", "start", "--workspace=frontend"]
