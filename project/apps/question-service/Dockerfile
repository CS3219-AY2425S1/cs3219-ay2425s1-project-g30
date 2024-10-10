FROM node:18-alpine AS base

# Enable Corepack (for pnpm and yarn version management)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Add necessary packages for compatibility
RUN apk update && apk add --no-cache libc6-compat

# --------------------
# Builder Stage
# --------------------
FROM base AS builder

# Install Turbo globally
RUN pnpm add -g turbo@^2.1.2

# Set the working directory
WORKDIR /app

# Copy all files from the monorepo
COPY . .

# Prune the monorepo, isolating the question-service
RUN turbo prune --scope=question-service --docker

# --------------------
# Installer Stage
# --------------------
FROM base AS installer

# Set the working directory
WORKDIR /app

# Install dependencies using pruned package.json and pnpm-lock.yaml
COPY --from=builder /app/out/json/ .

RUN pnpm install --frozen-lockfile

# Copy the pruned source files
COPY --from=builder /app/out/full/ .

# Build the question-service project
RUN pnpm turbo run build --filter=question-service...

# --------------------
# Runner Stage
# --------------------
FROM base AS runner

# Don't run production as root (security best practice)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

WORKDIR /app

# Copy the files from the installer and set the ownership to the non-root user (nodejs)
COPY --from=installer --chown=nodejs:nodejs /app .

# Set the working directory to the service directory
WORKDIR /app/apps/question-service

USER nodejs

# Expose the service's port
EXPOSE 3001

# Start the NestJS question-service
CMD ["pnpm", "start"]
