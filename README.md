# ScamShield 🛡️

**Production-Ready Scam & Fraud Defense Application for Indian Digital Citizens**

[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14%20App%20Router-black.svg)](https://nextjs.org/)
[![Vitest](<https://img.shields.io/badge/Vitest-Passed%20(49%2F49)-brightgreen.svg>)](https://vitest.dev/)
[![Offline Accuracy](<https://img.shields.io/badge/Accuracy-94.7%25%20(Gate%20%E2%89%A585%25)-success.svg>)](ml/MODEL_CARD.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

ScamShield helps people decide in seconds whether an SMS, WhatsApp message, email, or link is fraudulent (fake banks, electricity disconnection notices, courier customs fee lures, work-from-home traps, or digital arrest extortion) and teaches them _why_ using highlighted red flags, lookalike domain alerts, and actionable defense steps.

---

## ⚡ Quick Start (One Command)

To run everything locally in a single command:

```bash
git clone https://github.com/your-org/scamshield.git && cd scamshield && pnpm install && pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Full Quality Check

```bash
# Run all 49 unit, regression, SSRF, and component tests
pnpm -r test

# Typecheck and lint
pnpm -r typecheck && pnpm -r lint

# Production build
pnpm build
```

---

## 🏗️ Architecture & Monorepo Layout

```
scamshield/
├── apps/
│   └── web/                # Next.js 14 App Router (UI + REST API)
│       ├── app/
│       │   ├── api/v1/     # REST Endpoints: analyze/text, analyze/image, analyze/url, feedback, stats
│       │   ├── learn/      # Educational Center & 10-Question Interactive Quiz
│       │   ├── stats/      # Public Anonymous Real-Time Telemetry Dashboard
│       │   ├── privacy/    # Privacy Policy & Automated PII Redaction Details
│       │   ├── layout.tsx  # Global Layout with CSP/HSTS headers & Theme
│       │   └── page.tsx    # Responsive Scanner & Red Flag Viewer
│       ├── components/     # AnalyzerForm, ResultCard, RedFlagHighlight, Quiz, CategoryExplainer
│       ├── lib/            # Prisma Client, Redis Token Bucket Limiter, HMAC Hasher, Pino Logger
│       ├── i18n/           # English (en.json), Hindi (hi.json), and Assamese scaffold (as.json)
│       └── prisma/         # PostgreSQL Schema (Analysis, Feedback, QuizResult)
├── packages/
│   └── detector/           # Pure TypeScript Detection Engine (zero native runtime deps)
│       ├── src/
│       │   ├── rules/      # Regex engine (English, Hindi, Hinglish), brand allowlists
│       │   ├── url/        # URL parser (tldts), Levenshtein lookalike, homographs, defanging
│       │   ├── ml/         # Sublinear TF-IDF + Logistic Regression TS runtime (<1ms execution)
│       │   ├── ai/         # Anthropic Claude SDK explainer with prompt-injection delimiters
│       │   └── fusion.ts   # Multi-signal Score Fusion formula
│       └── __tests__/      # Vitest suites (Rules, ML, URL, SSRF, Fusion, Benchmark fixtures)
├── ml/                     # Offline training pipeline (scikit-learn, TF-IDF, MODEL_CARD.md)
├── infra/                  # Multi-stage Dockerfile, docker-compose.prod.yml, Caddyfile, smoke-test.sh
└── docs/                   # ARCHITECTURE.md, THREAT_MODEL.md, API.md, DEPLOYMENT.md
```

---

## 🎯 Verification & Acceptance Criteria

### Phase 1 Acceptance Criteria

> **Input:** `Dear Customer, your SBI KYC expires today, verify via http://sbi-kyc-update.xyz or account will be blocked`  
> **Output:**
>
> - **Verdict:** `🚨 Likely Scam`
> - **Risk Score:** `100/100` (threshold $\ge 60$)
> - **Category:** `Bank / KYC Expiry Scam`
> - **Red Flags Highlighted:**
>   - `SBI` (+20: Impersonated institutional brand)
>   - `KYC expires today` (+40: Artificial urgency & credential theft lure)
>   - `account will be blocked` (+35: Intimidation & suspension threat)
>   - `http://sbi-kyc-update.xyz` (Defanged URL, brand impersonation spoofing `SBI / sbi.co.in`, risky TLD `.xyz`)

### Phase 2 Accuracy Gate

> **Requirement:** Offline regression suite achieves $\ge 85\%$ accuracy across 57+ benchmark messages.  
> **Result:** Achieved **94.7%** accuracy offline with zero external network dependencies.

---

## 🔬 Detection Pipeline & Score Fusion Formula

```
Input Text/Screenshot/URL
          │
          ├──► Rules Engine (50%): Urgency, KYC, OTP/PIN, Arrest threats (Eng, Hin, Hinglish)
          ├──► URL Analyzer (20%): tldts parse, brand allowlist Levenshtein, homographs, IP hosts
          ├──► ML Classifier (30%): Sublinear TF-IDF (1-2 word n-grams) + Logistic Regression
          └──► AI Explainer (Optional): Claude JSON structured assessment (nudge bounded [-10, +10])
          │
          ▼
Score Fusion Formula:
Final Score = clamp(0.50 * Rules + 0.30 * ML + 0.20 * URL + aiNudge, 0, 100)
Safety Floor: High-confidence fraud triggers (e.g. KYC + spoofed domain) enforce a minimum score of 70+.
```

- `0 – 29`: **Likely Safe** 🛡️
- `30 – 59`: **Suspicious** ⚠️
- `60 – 100`: **Likely Scam** 🚨

---

## 🖼️ Visual UI Tour

### 1. Multi-Channel Scanner (Text, Screenshot OCR, URL)

```
┌────────────────────────────────────────────────────────────────────────┐
│  🛡️ ScamShield — India Fraud Defense Engine     Cyber Helpline: 1930   │
├────────────────────────────────────────────────────────────────────────┤
│  [📝 Paste Message]  [📷 Screenshot (OCR)]  [🔗 Check URL]            │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Dear Customer, your SBI KYC expires today, verify via              │ │
│ │ http://sbi-kyc-update.xyz or account will be blocked               │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│  Supports English, Hindi (हिंदी), and Hinglish           102 / 5,000   │
│  [🔍 Analyze Message]                                                  │
└────────────────────────────────────────────────────────────────────────┘
```

### 2. Explainable Result Card & Defanged Link

```
┌────────────────────────────────────────────────────────────────────────┐
│  🚨 LIKELY SCAM   Category: BANK KYC           Risk Score: 100 / 100   │
│  ════════════════════════════════════════════════════════════════════  │
│  Highlighted Analysis:                                                 │
│  "Dear Customer, your <mark>SBI (+20)</mark> <mark>KYC expires today  │
│  (+40)</mark>, verify via link or <mark>account will be blocked (+35)  │
│  </mark>"                                                              │
│                                                                        │
│  🔗 Suspicious Link (Defanged):                                        │
│  hxxp://sbi-kyc-update[.]xyz                                           │
│  ⚠️ Brand Spoofing Alert: Domain mimics STATE BANK OF INDIA (sbi.co.in) │
│                                                                        │
│  🎯 What the scammer wants: Credentials to drain your bank account.    │
│  🛡️ Recommended Actions: Do NOT click, never share OTP, dial 1930.     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎤 3-Minute Pitch Outline

### Minute 1: The Epidemic (The Hook)

> "In the past year alone, Indians lost over **₹7,488 crore** to cyber financial fraud. Every single day, millions of citizens—from college students to retired seniors—receive frantic SMS alerts: _'Your electricity will be cut at 9:30 PM,'_ _'Your bank KYC is expired,'_ or video calls from fake police stations threatening 'digital arrest.'
>
> People panic and click. Why? Because existing spam filters are binary and silent. They either delete the message or let it through without teaching the victim _why_ it is dangerous."

### Minute 2: The Solution (ScamShield)

> "We built **ScamShield**: an instant, production-ready fraud defense engine tailored specifically for Indian communication patterns.
>
> A citizen simply pastes a suspicious text, drops a WhatsApp screenshot, or enters a URL. In less than 20 milliseconds, ScamShield's pure-TypeScript engine evaluates 14 weighted Indian fraud indicators, inspects lookalike domains (flagging `sbi-update.xyz` against the real `sbi.co.in`), and runs offline ML inference.
>
> It delivers an explainable verdict: **Likely Scam**, marks the exact psychological red flags inline, explains _'What the scammer wants,'_ and gives immediate, actionable steps—including direct links to `cybercrime.gov.in` and the National Cyber Helpline **1930**."

### Minute 3: Tech Defensibility & Social Impact

> "Unlike naive wrappers, ScamShield is built for extreme privacy and resilience:
>
> 1. **Zero Raw Storage**: Messages are processed in ephemeral memory. Only a salted HMAC hash is kept for deduplication.
> 2. **SSRF Immune**: We never fetch third-party links from our servers; all links are defanged.
> 3. **Offline & Multi-lingual**: Works natively in English, Hindi, and Hinglish without requiring external LLMs.
> 4. **Education-First**: Includes an interactive 10-question 'Spot the Scam' quiz and educational hub.
>
> ScamShield turns every citizen from an easy target into an informed cyber defender. Thank you."

---

## 🎬 Live Demo Script (Step-by-Step)

| Step                     | Action                                                          | What to Say / Demonstrate                                                                                                                                                                       |
| ------------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Overview**          | Open `http://localhost:3000`                                    | "Notice the clean, mobile-first interface, emergency 1930 helpline badge, and in-app language switcher for Hindi."                                                                              |
| **2. Fake KYC Scam**     | Click _"🏦 Fake SBI KYC Scam"_ sample, then _"Analyze Message"_ | "Watch how quickly the engine processes the message. In milliseconds, it renders a **100/100 Likely Scam** verdict."                                                                            |
| **3. Highlighted Flags** | Hover over highlighted red flags in the result                  | "Notice how ScamShield doesn't just say 'Scam'. It highlights 'SBI', 'KYC expires today', and 'account will be blocked', showing the user the exact psychological manipulation tactics."        |
| **4. Defanged Link**     | Point out `hxxp://sbi-kyc-update[.]xyz`                         | "The malicious link is automatically defanged with brackets. It cannot be clicked accidentally, and our lookalike detector warns the user that it mimics official State Bank of India domains." |
| **5. Screenshot OCR**    | Switch to _"Screenshot (OCR)"_ tab and upload a sample          | "Users don't even need to type. Our built-in Tesseract worker extracts text from WhatsApp and SMS screenshots in both English and Hindi."                                                       |
| **6. Interactive Quiz**  | Click _"Learn & Quiz"_ in navbar, start the 10-question quiz    | "Show the interactive quiz where citizens practice spotting real vs scam messages, getting immediate educational feedback."                                                                     |
| **7. Privacy & Stats**   | Click _"Live Stats"_ and _"Privacy Policy"_                     | "Highlight our zero-PII architecture: all phone numbers and OTPs are auto-redacted and raw text is never stored by default."                                                                    |

---

## 🔒 Security Hardening Summary

- **Content-Security-Policy (CSP)**: Strict default-src, script-src, and frame-ancestors DENY.
- **SSRF Protection**: Fully verified via automated test suite. Zero outbound network sockets opened during URL parsing.
- **Client-Side Secret Masking**: OTPs and credit card digits are masked on the client browser before submission.
- **Rate Limiting**: Redis sliding-window token bucket (30 req/min text, 10 req/min OCR) with memory fallback.
- **PII Scrubbing**: Automated regex redact on phone, card, account, and OTP tokens with a 30-day retention purge script.

---

## 📄 Documentation Directory

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): Complete system architecture and pipeline diagrams.
- [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md): STRIDE threat model covering Prompt Injection, SSRF, DoS, and Data Leakage.
- [`docs/API.md`](docs/API.md): Full OpenAPI and REST endpoint documentation.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md): Production VPS, Docker, Caddy auto-HTTPS, and database backup guides.
- [`ml/MODEL_CARD.md`](ml/MODEL_CARD.md): Logistic Regression model card with precision/recall metrics.

---

## 📜 License

MIT License. Designed and engineered for open digital public good.
