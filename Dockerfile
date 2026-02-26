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

# Init DB + seed (run from project root so profiles.db lands at /app/profiles.db)
RUN bun run packages/db/src/migrate.ts && bun run packages/db/src/seed.ts && bun run packages/db/src/seed-items.ts && bun run packages/db/src/seed-library.ts

EXPOSE 3000
CMD ["bun", "run", "packages/api/src/index.ts"]
