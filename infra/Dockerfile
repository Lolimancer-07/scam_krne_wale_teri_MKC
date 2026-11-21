# syntax=docker/dockerfile:1

# ScamShield production image.
# The detector is consumed as TypeScript source, so the whole workspace is
# installed and built inside the image; the runtime image serves the build.
FROM node:22-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@12.20.0 --activate

WORKDIR /app

# ── Dependencies ──────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/detector/package.json ./packages/detector/package.json
RUN pnpm install --frozen-lockfile

# ── Build ─────────────────────────────────────────────────────────────────
FROM deps AS builder
COPY . .
RUN pnpm --filter @scamshield/detector build \
  && pnpm --filter @scamshield/web exec prisma generate \
  && pnpm --filter @scamshield/web build

# ── Runtime ───────────────────────────────────────────────────────────────
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000

# Install only the Prisma CLI needed for `migrate deploy` at startup.
RUN npm install -g prisma@5.22.0

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/detector/node_modules ./packages/detector/node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/prisma ./apps/web/prisma
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/next.config.mjs ./apps/web/next.config.mjs
COPY --from=builder /app/packages/detector ./packages/detector
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

USER node

EXPOSE 3000

# Apply pending migrations, then serve the built app.
CMD ["sh", "-c", "cd apps/web && prisma migrate deploy && pnpm start"]
