FROM oven/bun:1 AS base
WORKDIR /app

# Install deps
COPY package.json bun.lock ./
COPY packages/core/package.json packages/core/
COPY packages/db/package.json packages/db/
COPY packages/api/package.json packages/api/
COPY packages/web/package.json packages/web/
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build frontend
RUN cd packages/web && bun run build

# Init DB + seed
RUN bun run db:push && bun run db:seed

EXPOSE 3000
CMD ["bun", "run", "packages/api/src/index.ts"]
