# ScamShield 🛡️

**AI-powered scam message detector for Indian users**

Paste any suspicious SMS, WhatsApp, or email message and get an instant verdict: `safe`, `suspicious`, or `likely_scam`.

---

## Monorepo Structure

```
scamshield/
├── apps/
│   └── web/              # Next.js 14 App Router (UI + REST API)
├── packages/
│   └── detector/         # Core detection engine (framework-agnostic)
└── docs/
    ├── ARCHITECTURE.md
    ├── THREAT_MODEL.md
    ├── API.md
    └── DEPLOYMENT.md
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run tests
pnpm test

# Type check
pnpm typecheck
```

## Key Assumptions

1. **Target users are Indian** — detection rules are tuned to Indian scam patterns (UPI, Aadhaar, TRAI-style OTP scams)
2. **Text-first MVP** — image OCR (Tesseract.js) is scaffolded but not wired; it's a future enhancement
3. **AI is opt-in** — Claude is only called when `enableAi: true` to manage API costs
4. **No PII storage** — submitted messages are analyzed in-memory and not persisted by default
5. **Rate limiting via Redis** — the app requires Redis in production; falls back gracefully in dev

## Tech Stack

| Concern    | Technology                                  |
| ---------- | ------------------------------------------- |
| Framework  | Next.js 14 App Router                       |
| Styling    | Tailwind CSS + shadcn/ui                    |
| Detection  | Custom rule engine (`@scamshield/detector`) |
| AI         | Anthropic Claude (optional nudge)           |
| Database   | PostgreSQL via Prisma                       |
| Cache      | Redis via ioredis                           |
| Testing    | Vitest + Playwright                         |
| Monitoring | Sentry + Pino                               |

## Score Formula

```
finalScore = 0.5 × ruleScore + 0.3 × mlScore + 0.15 × urlScore + 0.05 × aiNudge
```

## API

See [`docs/API.md`](docs/API.md) for full API reference.

## License

MIT
