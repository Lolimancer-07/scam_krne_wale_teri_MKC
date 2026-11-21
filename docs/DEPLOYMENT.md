# ScamShield — Deployment Guide

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+
- Redis 7+

## Local Development

```bash
# 1. Clone and install
git clone <repo>
cd scamshield
pnpm install

# 2. Configure env
cp .env.example .env
# Edit .env with your values

# 3. Database setup
make db:generate
make db:push

# 4. Start dev server
make dev
```

## Production Build

```bash
pnpm build
# Output: apps/web/.next/
```

## Environment Variables

See [`.env.example`](../.env.example) for the full list.

| Variable                 | Required | Description                      |
| ------------------------ | -------- | -------------------------------- |
| `DATABASE_URL`           | ✅       | PostgreSQL connection string     |
| `REDIS_URL`              | ✅       | Redis connection string          |
| `ANTHROPIC_API_KEY`      | ⚠️       | Required only if `enableAi=true` |
| `NEXT_PUBLIC_SENTRY_DSN` | ❌       | Sentry error tracking            |

## Docker (Future)

Docker Compose configuration will be added in a future iteration.

## Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel project settings
3. Deploy — Vercel auto-detects Next.js

## Health Check

`GET /api/health` — Returns `{ "status": "ok" }` (to be implemented).
