# Builds a Vite/React app with pnpm and serves it via `serve` (Node).
FROM node:20-slim AS base
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# --- deps ---
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN pnpm run build

# --- runner ---
FROM node:20-slim AS runner
WORKDIR /app
RUN npm install -g serve@14
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
