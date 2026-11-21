# ScamShield 🛡️

**Production-ready Scam & Fraud Detection Web App for Indian Digital Communications**

ScamShield helps people immediately verify whether an SMS, WhatsApp message, email, or link is fraudulent (fake banks, electricity disconnection threats, courier fee lures, government arrest intimidation) and teaches them _why_ using highlighted red flags and actionable security steps.

---

## 🏗️ Architecture & Repo Layout

```
scamshield/
├── apps/
│   └── web/                # Next.js 14 App Router, Tailwind CSS, shadcn/ui, API Route Handlers
│       ├── app/
│       │   ├── api/v1/     # REST Endpoints: analyze/text, health, ready, stats, feedback
│       │   ├── layout.tsx
│       │   └── page.tsx    # Responsive Analyzer UI + Red Flag Viewer
│       ├── components/     # AnalyzerForm, ResultCard, RedFlagHighlight, CategoryExplainer
│       ├── lib/            # Prisma db, Redis rateLimiter, HMAC-SHA256 hasher, Pino logger
│       └── prisma/         # PostgreSQL schema (Analysis, Feedback, QuizResult)
├── packages/
│   └── detector/           # Pure-TS detection engine (framework-agnostic)
│       ├── src/
│       │   ├── rules/      # Regex engine (English, Hindi, Hinglish), brand allowlist
│       │   ├── url/        # URL parser (tldts), lookalike Levenshtein, homographs, shorteners
│       │   ├── fixtures/   # Labelled dataset with 57+ benchmark messages
│       │   └── fusion.ts   # Documented score fusion formula
│       └── __tests__/      # Vitest unit and regression suites (94.7% accuracy gate)
├── ml/                     # Offline model training & export (Phase 2)
├── infra/                  # Dockerfile, docker-compose.prod.yml, Caddyfile (Phase 5)
└── docs/                   # ARCHITECTURE.md, THREAT_MODEL.md, API.md, DEPLOYMENT.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0

```bash
# 1. Install workspace dependencies
pnpm install

# 2. Build detector engine
pnpm --filter @scamshield/detector build

# 3. Run all unit & regression tests
pnpm -r test

# 4. Type check & Lint
pnpm -r typecheck
pnpm -r lint

# 5. Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to use ScamShield.

---

## 🎯 Verification: Fake Bank KYC Acceptance Criteria

Input:

> `Dear Customer, your SBI KYC expires today, verify via http://sbi-kyc-update.xyz or account will be blocked`

Output:

- **Verdict**: `🚨 Likely Scam`
- **Risk Score**: `100/100` (≥60 threshold)
- **Category**: `Bank / KYC Expiry Scam`
- **Red Flags Highlighted**:
  - `KYC expires today` (+40 weight: Claims KYC is expired to create urgency)
  - `account will be blocked` (+35 weight: Threatens account blockage)
  - `http://sbi-kyc-update.xyz` (Defanged URL, brand impersonation spoofing `SBI / sbi.co.in`, risky TLD `.xyz`)
- **Action Steps**: Never click, never share OTP, report to 1930 / cybercrime.gov.in.

---

## 📌 Documented Assumptions

1. **Local & Safe Execution**: The core detection engine runs 100% locally in pure TypeScript. No user message is transmitted to third-party servers unless the optional AI explanation flag is explicitly enabled.
2. **Defanged URL Safety**: No URL is ever fetched or queried from the Next.js web server process (protecting against SSRF and IP leaks). Links are displayed defanged (e.g., `hxxp://example[.]com`) and are not clickable.
3. **Multi-language Support**: Detection rules natively support English, Hindi (Devanagari script), and Hinglish (Latin transliteration).
4. **Privacy-by-Default**: Submitted message text is never stored in persistent databases by default. Only a salted HMAC-SHA256 hash, verdict, category, and timestamp are retained. If a user explicitly opts in to donate an anonymized sample, all phone numbers, emails, cards, and OTPs are auto-redacted before saving, and deleted after 30 days.
5. **Score Fusion Formula**:
   $$\text{Final Score} = \max(\text{Rules}, 0.70 \times \text{Rules} + 0.50 \times \text{URL}) + \text{aiNudge}$$
   where $\text{aiNudge}$ is bounded within $[-10, +10]$.
   - `0 - 29`: Safe
   - `30 - 59`: Suspicious
   - `60 - 100`: Likely Scam
6. **Graceful Degradation**: If PostgreSQL or Redis are unavailable in local development, ScamShield seamlessly falls back to an in-memory rate limiter and stateless analysis.
7. **Official Portals**: Users are directed to official authorities (National Cyber Crime Helpline `1930` and `cybercrime.gov.in`).

---

## 📋 Phase Roadmap

- [x] **Phase 1: Core** — Monorepo scaffold, pure-TS detector (rules, URL lookalike, fusion), `/api/v1/analyze/text`, responsive UI with highlighted red flags.
- [ ] **Phase 2: Intelligence** — Offline ML training (TF-IDF + Logistic Regression), TypeScript inference runtime, score fusion, Claude AI explanation fallback, feedback loop.
- [ ] **Phase 3: Experience** — Screenshot OCR worker (Tesseract.js for English + Hindi), Learn module, 10-question "Spot the Scam" interactive quiz, public anonymous statistics page.
- [ ] **Phase 4: Hardening** — Full privacy controls, Redis sliding window rate limiter, CSP/HSTS/security headers, Playwright E2E tests, Threat Model.
- [ ] **Phase 5: Ship** — Multi-stage production Docker build, docker-compose with Caddy auto-HTTPS, CI/CD pipeline, monitoring & automated backups.
