# --- deps: install dependencies (native module build tools included for better-sqlite3) ---
FROM node:20-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# --- builder: build the Next.js app ---
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- runner: minimal production image ---
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

# Next.js standalone server + static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# better-sqlite3's compiled native binary (standalone tracing doesn't always pick it up)
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3

# recipe/pantry seed data read at runtime from disk
COPY --from=builder /app/data/recipes ./data/recipes
COPY --from=builder /app/data/pantry-staples.json ./data/pantry-staples.json
COPY --from=builder /app/data/small-quantity-items.json ./data/small-quantity-items.json

# writable at runtime: sqlite db + image cache (mount data/db and data/image-cache.json as a volume)
RUN mkdir -p /app/data/db && chown -R nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
