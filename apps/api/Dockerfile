FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

FROM base AS builder
# Install turbo globally
RUN pnpm add -g turbo@2.4.2
WORKDIR /app
COPY . .
# Prune the workspace to only what's needed for the api app
RUN turbo prune --scope=api --docker

FROM base AS installer
WORKDIR /app

# First copy only the files needed for installing dependencies (optimized for caching)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --no-frozen-lockfile

# Copy the actual source code and build
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Build the whole project (including workspace dependencies)
RUN pnpm turbo build --filter=api...

FROM base AS runner
WORKDIR /app

# Create a non-root user with a home directory
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --home /home/expressjs --ingroup nodejs expressjs
USER expressjs

# Set HOME environment variable
ENV HOME=/home/expressjs

COPY --from=installer /app .

ENV NODE_ENV=production
ENV PORT=3001
ENV PNPM_HOME="/home/expressjs/.pnpm"
ENV PATH="$PNPM_HOME:$PATH"

EXPOSE 3001

# Run the API with pnpm filter so it finds the app-specific start script
CMD ["pnpm", "--filter", "api", "start"]
