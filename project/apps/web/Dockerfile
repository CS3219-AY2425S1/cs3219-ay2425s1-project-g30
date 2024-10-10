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

# Prune the monorepo, isolating the web
RUN turbo prune --scope=web --docker

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

# Build the web project
RUN pnpm turbo run build --filter=web...

# --------------------
# Runner Stage
# --------------------
FROM base AS runner

# Don't run production as root (security best practice)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy the files from the installer and set the ownership to the non-root user (nodejs)
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Set the working directory to the service directory
WORKDIR /app/apps/web

USER nextjs

# Expose the service's port
EXPOSE 3000

# Start the NestJS web
CMD node server.js

