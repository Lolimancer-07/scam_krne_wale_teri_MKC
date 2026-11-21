# ScamShield — Architecture

## Overview

ScamShield is a monorepo-based AI scam detection system designed to protect Indian users from common SMS/WhatsApp scam patterns.

## Monorepo Structure

```
scamshield/
├── apps/
│   └── web/              # Next.js 14 App Router frontend + API
├── packages/
│   └── detector/         # Core detection engine (framework-agnostic)
└── docs/                 # Architecture, threat model, API docs
```

## Detection Pipeline

```
Input Text
    │
    ▼
┌─────────────────────────────────────────────────┐
│              packages/detector                   │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Rule     │  │ URL      │  │ ML / Heuristic│  │
│  │ Engine   │  │ Analyzer │  │ Scorer        │  │
│  └────┬─────┘  └────┬─────┘  └──────┬────────┘  │
│       │             │               │            │
│       └─────────────┴───────────────┘            │
│                     │                            │
│               ┌─────▼──────┐                     │
│               │   Fusion   │                     │
│               │  (scoring) │                     │
│               └─────┬──────┘                     │
└─────────────────────┼───────────────────────────┘
                      │
                      ▼
              DetectionResult
```

## Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Frontend   | Next.js 14 App Router, React 18     |
| Styling    | Tailwind CSS + shadcn/ui            |
| Detection  | Custom rule engine + tldts          |
| AI Nudge   | Anthropic Claude                    |
| OCR        | Tesseract.js                        |
| Database   | PostgreSQL (Prisma ORM)             |
| Cache/Rate | Redis (ioredis)                     |
| Monitoring | Sentry, Pino                        |
| Testing    | Vitest, Playwright, Testing Library |

## Score Fusion Formula

```
finalScore = 0.5 * ruleScore + 0.3 * mlScore + 0.15 * urlScore + 0.05 * aiNudge
```

Verdict thresholds:

- `safe`: score < 40
- `suspicious`: 40 ≤ score < 70
- `likely_scam`: score ≥ 70
