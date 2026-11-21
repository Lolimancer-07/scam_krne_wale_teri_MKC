# ScamShield Architecture 🛡️

## 1. System Overview

ScamShield is an open, production-ready full-stack fraud defense application and heuristic detection pipeline built specifically to safeguard Indian citizens against rampant digital financial fraud (fake KYC expiry, UPI collect requests, electricity power cut notices, courier customs fee lures, and digital arrest extortion).

The monorepo is engineered using a clean separation of concerns:

- `apps/web`: Next.js 14 App Router (React, Tailwind CSS, shadcn/ui, Route Handlers, Prisma, Redis rate limiter, Tesseract.js worker).
- `packages/detector`: A pure, framework-agnostic TypeScript detection engine with zero native runtime dependencies (regex rules, Levenshtein brand lookalike mapping, TF-IDF + Logistic Regression inference, and bounded LLM scoring fusion).
- `ml/`: Python offline training pipeline (scikit-learn, TF-IDF feature extraction, Logistic Regression, and model weight serialization).
- `infra/`: Multi-stage Dockerfile, docker-compose production orchestration with Caddy auto-HTTPS reverse proxy, and post-deploy smoke tests.

---

## 2. Monorepo Component Diagram

```
                                 User Ingress (Browser)
                                           │
                                           ▼
                                 ┌───────────────────┐
                                 │   Caddy Reverse   │  Auto-HTTPS, HSTS
                                 │       Proxy       │  Rate Limit Ingress
                                 └─────────┬─────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │            apps/web (Next.js 14)             │
                    │                                              │
                    │   ┌──────────────────────────────────────┐   │
                    │   │        React Client UI (SSR/CSR)     │   │
                    │   │  - AnalyzerForm (Text, Image, URL)   │   │
                    │   │  - RedFlagHighlight (Safe marks)     │   │
                    │   │  - ResultCard & CategoryExplainer    │   │
                    │   │  - Learn & 10-Question Interactive   │   │
                    │   │  - Stats Dashboard & i18n Switcher   │   │
                    │   └──────────────────┬───────────────────┘   │
                    │                      │                       │
                    │                      ▼                       │
                    │   ┌──────────────────────────────────────┐   │
                    │   │       Next.js /api/v1 Handlers       │   │
                    │   │  - POST analyze/text                 │   │
                    │   │  - POST analyze/image (Tesseract OCR)│   │
                    │   │  - POST analyze/url                  │   │
                    │   │  - POST feedback                     │   │
                    │   │  - GET stats, health, ready          │   │
                    │   └──────────────────┬───────────────────┘   │
                    └──────────────────────┼───────────────────────┘
                                           │
                                           ▼
             ┌───────────────────────────────────────────────────────────┐
             │            packages/detector (Pure TypeScript)            │
             │                                                           │
             │   ┌───────────────┐  ┌───────────────┐  ┌─────────────┐   │
             │   │  Rules Engine │  │ URL Analyzer  │  │ ML Classifier│  │
             │   │  - Urgency    │  │ - tldts parse │  │ - Sublinear │   │
             │   │  - KYC / OTP  │  │ - Levenshtein │  │   TF-IDF    │   │
             │   │  - Arrests    │  │ - Homographs  │  │ - LogReg    │   │
             │   │  - Eng/Hin/Hng│  │ - Defanging   │  │   weights   │   │
             │   └───────┬───────┘  └───────┬───────┘  └──────┬──────┘   │
             │           │                  │                 │          │
             │           └──────────────────┼─────────────────┘          │
             │                              ▼                            │
             │                   ┌─────────────────────┐                 │
             │                   │ Multi-Signal Fusion │                 │
             │                   │ + Opt. Claude Nudge │                 │
             │                   └──────────┬──────────┘                 │
             └──────────────────────────────┼────────────────────────────┘
                                            ▼
                                  Deterministic Verdict
                         (Safe / Suspicious / Likely Scam)
```

---

## 3. Detection Pipeline Stages

### Stage 1: Rules Engine (`packages/detector/src/rules/`)

- Evaluates 14 fine-tuned weighted signal categories:
  - `otp_request` (+45)
  - `pin_cvv_request` (+50)
  - `kyc_lure` (+40)
  - `arrest_threat` (+55)
  - `account_block_threat` (+35)
  - `urgency` (+20)
  - `refund_prize_lure` (+35)
  - `job_task_scam` (+45)
  - `investment_crypto` (+45)
  - `delivery_lure` (+35)
  - `impersonated_brand` (+20)
  - `phone_callback_lure` (+20)
- **Multi-lingual**: English, Hindi (Devanagari: `तुरंत`, `केवाईसी`, `बिजली`), and Hinglish (`band ho jayega`, `turant call kare`).
- **Defensive Counter-rules**: Phrases like _"Do NOT share your OTP with anyone"_ are explicitly exempted via `negativePatterns` to eliminate false positives on real bank authentication texts.

### Stage 2: URL Analyzer (`packages/detector/src/url/`)

- Normalizes and parses domain hierarchies via `tldts`.
- Computes Levenshtein edit distance and confusable homograph substitution (e.g. `sb1` -> `sbi`, `@` -> `a`, `0` -> `o`).
- Identifies risky disposable TLDs (`.xyz`, `.top`, `.club`, `.site`, `.pw`, `.online`, `.click`).
- Quarantines IP hosts, basic-auth `@` tricks, and excessive subdomain spoofing.
- **SSRF Safety**: Never opens TCP sockets or fetches remote web pages. URLs are defanged (`hxxp://...` with `[.]`) for display.

### Stage 3: ML Inference Runtime (`packages/detector/src/ml/`)

- Offline training in `ml/train.py` on UCI SMS Spam + Curated Indian Cybercrime datasets.
- Serialized 800-feature vocabulary and regression coefficients loaded in memory (`model.json`).
- Pure TypeScript implementation computes:
  $$z = b + \sum_{i} w_i \cdot x_i$$
  $$\sigma(z) = \frac{1}{1 + e^{-z}}$$
- Sub-millisecond runtime execution with zero C++ native bindings.

### Stage 4: Optional LLM Explanation Layer (`packages/detector/src/ai/`)

- Behind feature flag `ENABLE_AI_EXPLANATION=true` using Anthropic Claude SDK.
- User input is quarantined in `<untrusted_user_message>` with strict prompt injection guardrails.
- Validated via Zod: `{ category, explanation, recommended_actions, confidence, nudge }`.
- AI is restricted to a minor score nudge bounded within $[-10, +10]$. Rules + ML maintain core verdict authority.

### Stage 5: Score Fusion (`packages/detector/src/fusion.ts`)

$$\text{combined} = 0.50 \times \text{ruleScore} + 0.30 \times \text{mlScore} + 0.20 \times \text{urlScore} + \text{aiNudge}$$

- **Thresholds**:
  - `0 - 29`: Safe
  - `30 - 59`: Suspicious
  - `60 - 100`: Likely Scam
- **Safety Floor**: High-confidence indicators (KYC + spoofed domain, or arrest extortion) enforce an irreversible minimum score of 65+, preventing dilution.

---

## 4. Privacy & Data Lifecycle

1. **Default Mode (Ephemeral)**: Raw message is processed in memory and discarded. Only salted HMAC-SHA256, score, category, and timestamp are stored in PostgreSQL.
2. **Opt-in Sample Contribution**: Anonymized donation triggers automated regex redaction of phone numbers, emails, credit cards, bank accounts, and OTPs.
3. **Automated Purge**: Cron script permanently deletes opted-in samples after 30 days.
