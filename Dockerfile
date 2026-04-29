# ── Build stage ──────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# Copy dependency & config files first for better layer caching
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci --include=dev

# Copy source code
COPY src/ src/

# Compile TypeScript → JavaScript
RUN npx tsc --project tsconfig.json

# ── Production stage ─────────────────────────────────────────
FROM node:20-slim AS runner

WORKDIR /app

# Copy package files (needed for "type": "module" and dep resolution)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled JS output
COPY --from=builder /app/dist/ dist/

# Cloud Run injects PORT env var (defaults to 8080)
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]
