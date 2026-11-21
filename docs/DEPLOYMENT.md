# ScamShield — Production Deployment & Operations Guide 🚀

## 1. Quick Production Deployment (Single VPS + Docker + Caddy)

The default target is an Ubuntu/Debian VPS (e.g. Hetzner, DigitalOcean, AWS EC2, GCP e2-medium) running Caddy for automated Let's Encrypt HTTPS certificates.

### Step 1: Provision Server & Clone Repo

```bash
sudo apt-get update && sudo apt-get install -y git curl docker.io docker-compose-v2
git clone https://github.com/your-org/scamshield.git /opt/scamshield
cd /opt/scamshield
```

### Step 2: Configure Production Environment

```bash
cp .env.example .env
nano .env
```

Ensure you set:

- `POSTGRES_PASSWORD`: Strong random string (e.g. `openssl rand -hex 24`)
- `APP_DOMAIN`: Your public domain (e.g. `scamshield.org` or `scam.yourdomain.com`)
- `MESSAGE_HASH_SALT`: Random 64-char hex secret (e.g. `openssl rand -hex 32`)
- `ENABLE_AI_EXPLANATION`: `true` (optional, requires `ANTHROPIC_API_KEY`)

### Step 3: Launch Stack

```bash
docker compose -f infra/docker-compose.prod.yml up -d --build
```

This automatically starts:

1. `postgres:16-alpine` (healthy database on isolated internal bridge)
2. `redis:7-alpine` (AOF persistence for rate limiting)
3. `web` (Next.js standalone runtime with Prisma migrations executed pre-traffic)
4. `caddy:2-alpine` (ports 80 & 443 with automatic TLS provisioning)

### Step 4: Verify Deployment with Smoke Tests

```bash
./infra/ci/smoke-test.sh https://scamshield.org
```

---

## 2. Alternative Serverless Deployment (Vercel + Neon + Upstash)

For zero-infrastructure deployment:

1. **Frontend / API**: Import the repository into [Vercel](https://vercel.com).
   - Framework preset: Next.js
   - Root directory: `apps/web`
2. **Database**: Provision a serverless PostgreSQL instance on [Neon](https://neon.tech) or Supabase.
   - Set `DATABASE_URL` in Vercel project settings.
   - Run `pnpm --filter @scamshield/web exec prisma migrate deploy`.
3. **Redis**: Create a serverless Redis instance on [Upstash](https://upstash.com).
   - Set `REDIS_URL=redis://default:...@...upstash.io:6379`.
4. Deploy! Vercel manages edge SSL and global routing.

---

## 3. Database Backup & Disaster Recovery Procedure

### Automated Daily Backup (Cron)

Create `/etc/cron.daily/scamshield-backup`:

```bash
#!/usr/bin/env bash
set -euo pipefail
BACKUP_DIR="/var/backups/scamshield"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "${BACKUP_DIR}"

docker compose -f /opt/scamshield/infra/docker-compose.prod.yml exec -T postgres \
  pg_dump -U scamshield scamshield | gzip > "${BACKUP_DIR}/scamshield_${TIMESTAMP}.sql.gz"

# Retain 14 daily backups locally
find "${BACKUP_DIR}" -type f -name "scamshield_*.sql.gz" -mtime +14 -delete
```

Make executable: `sudo chmod +x /etc/cron.daily/scamshield-backup`

### Complete Restore Procedure

```bash
# 1. Decompress desired backup
gunzip -c /var/backups/scamshield/scamshield_20261121_040000.sql.gz > /tmp/restore.sql

# 2. Re-create database schema and restore data
docker compose -f infra/docker-compose.prod.yml exec -T postgres dropdb -U scamshield --if-exists scamshield
docker compose -f infra/docker-compose.prod.yml exec -T postgres createdb -U scamshield scamshield
docker compose -f infra/docker-compose.prod.yml exec -T postgres psql -U scamshield -d scamshield < /tmp/restore.sql

# 3. Clean up temporary files
rm /tmp/restore.sql
```

---

## 4. Observability & Monitoring

- **Liveness probe**: `GET /api/v1/health` (HTTP 200 `{ status: "ok" }`)
- **Readiness probe**: `GET /api/v1/ready` (HTTP 200 `{ status: "ready", database: "connected" }`)
- **Structured JSON Logging**: Pino records log streams with PII redaction (`req.headers.cookie`, OTPs, passwords, card numbers are redacted to `[REDACTED_PII]`).
- **Error Tracking**: Configured via `@sentry/nextjs`. Simply provide `NEXT_PUBLIC_SENTRY_DSN` in production environment.
