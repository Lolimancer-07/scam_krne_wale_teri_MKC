# ScamShield — Frontend Codebase Audit

**Date:** November 2024  
**Scope:** `apps/web` (Next.js 14 App Router, React 18, Tailwind CSS, shadcn/ui tokens)  
**Target:** Reference guide for safe frontend refactoring and UI redesigns.

---

## 1. Page & Route Inventory

| Route       | File Path                       | Type                              | Purpose & Description                                                                                                                                                                                                                                                      |
| ----------- | ------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`         | `apps/web/app/page.tsx`         | Client Component (`'use client'`) | **Primary Detection Workspace**: Host page for the scanner. Contains hero banner, tabbed scanner form (`AnalyzerForm`), result view (`ResultCard`), language toggle (`en` / `hi`), cyber helpline alert (`1930`), and quick-navigation cards to Learn, Stats, and Privacy. |
| `/learn`    | `apps/web/app/learn/page.tsx`   | Client Component (`'use client'`) | **Educational & Quiz Center**: Dual-tab view featuring (1) **Scam Guide Hub** (6 comprehensive Indian scam cards: KYC, Electricity Bill, UPI QR, Digital Arrest, India Post, Job/Task scams) and (2) **10-Question Interactive Quiz** (`Quiz.tsx`).                        |
| `/stats`    | `apps/web/app/stats/page.tsx`   | Client Component (`'use client'`) | **Public Anonymous Telemetry**: Live dashboard displaying total message scans, 24-hour scan volume, scam probability ratios, top threat vector, visual verdict breakdown bar, and a graceful fallback banner when the database is in stateless mode.                       |
| `/privacy`  | `apps/web/app/privacy/page.tsx` | Server/Static Component           | **Privacy Policy & Security Guarantees**: Formal documentation of zero raw text storage by default, HMAC-SHA256 salted hashing, automated PII scrubbing (phone, email, card, OTP), 30-day retention purge, and SSRF-safe URL defanging.                                    |
| Root Layout | `apps/web/app/layout.tsx`       | Server Component                  | **Root HTML Shell**: Injects `Inter` font, sets metadata title/description, loads `globals.css`, and provides the baseline HTML container.                                                                                                                                 |

---

## 2. Core UI Components & Modals

### 2.1 Component Breakdown

#### `AnalyzerForm.tsx` (`apps/web/components/AnalyzerForm.tsx`)

- **Role**: Primary user input interface with three analysis modes:
  1. **Paste Message (`text`)**: Multi-line textarea (5,000 char max), character counter, sample scam quick-fill buttons, research opt-in checkbox, and submit button.
  2. **Screenshot OCR (`image`)**: Drag-and-drop / file selector for PNG, JPG, WebP (up to 5MB), image preview thumbnail, remove image button, and OCR extraction button.
  3. **Check URL (`url`)**: Single-line URL input with monospace styling for standalone link analysis against brand allowlists.
- **Embedded UI Elements**:
  - Tab switcher (`📝 Paste Message`, `📷 Screenshot (OCR)`, `🔗 Check URL`).
  - Privacy reminder banner (explains zero-storage and warns against pasting live OTPs/passwords).
  - Sample message pill list (`Fake SBI KYC`, `Electricity Bill Threat`, `Part-Time Job Scam`, `Digital Arrest Notice`, `Legit Bank Alert`).
  - Dynamic loading indicator with animated spinner and step-by-step progress text.
  - Inline red alert box for error messages.

#### `ResultCard.tsx` (`apps/web/components/ResultCard.tsx`)

- **Role**: Visual presentation of detection verdicts, scores, and actionable defense guidance.
- **Sub-sections**:
  1. **Verdict Banner**: Color-coded container (Red for `likely_scam`, Amber for `suspicious`, Green for `safe`), verdict badge, category pill, 0–100 risk score display, and animated progress bar.
  2. **Highlighted Message**: Renders original text with flagged spans highlighted via `RedFlagHighlight`, plus an itemized list of red flag tags with point weights (`+40`, `+35`, etc.) and explanations.
  3. **Suspicious Link Analysis (Defanged)**: Displayed only if links are detected; renders defanged monospace string (`hxxp://...`), brand impersonation alert banner (e.g. spoofing SBI with official domain `sbi.co.in`), and flag pills.
  4. **Category Breakdown**: Embeds `CategoryExplainer`.
  5. **Feedback & Reset Bar**: "Was this assessment accurate?" binary thumbs up/down feedback widget with asynchronous submission and "Check Another Message" reset button.

#### `RedFlagHighlight.tsx` (`apps/web/components/RedFlagHighlight.tsx`)

- **Role**: Security-hardened text highlighter.
- **Implementation Details**:
  - Takes `text: string` and `redFlags: RedFlag[]`.
  - Computes non-overlapping character slice boundaries using `startIndex` and `endIndex`.
  - Renders safe `<mark>` tags with tooltip titles and weight badges (`+weight`).
  - **Critical Security Invariant**: Does **NOT** use `dangerouslySetInnerHTML`. Preserves plain text rendering to prevent XSS.

#### `CategoryExplainer.tsx` (`apps/web/components/CategoryExplainer.tsx`)

- **Role**: Contextual education module mapped to the detected fraud category (`bank_kyc`, `otp_impersonation`, `upi_payment`, `delivery_courier`, `government_tax`, `lottery_prize`, `job_task`, `investment_crypto`, `other`).
- **Sub-sections**:
  - Category icon and human-readable title.
  - **"🎯 What the scammer wants"**: Explains psychological levers (fear, urgency, greed) and objective (credential theft, unauthorized debits).
  - **"🛡️ Recommended Action Steps"**: Bulleted list of actionable defenses (e.g., don't click, verify on official app, call 1930).
  - National Cyber Crime Helpline footer (`1930` / `cybercrime.gov.in`).

#### `Quiz.tsx` (`apps/web/components/Quiz.tsx`)

- **Role**: Self-contained interactive gamified quiz with 10 realistic Indian communication scenarios.
- **Sub-sections**:
  - Progress header (question index counter, score tracker, animated progress bar).
  - Scenario text card (monospace font, realistic SMS/WhatsApp excerpts).
  - Action buttons: `🚨 It's a SCAM` vs `🛡️ It's LEGITIMATE`.
  - Immediate feedback reveal banner (Correct / Incorrect badge, category, detailed explanation, key red flag indicators).
  - "Next Question" / "View Final Results" navigation.
  - Final results screen: Score breakdown, percentage accuracy, performance tier badge (`Cyber Guardian`, `Scam Vigilant`, `High Vulnerability`), and "Retake Quiz" button.

### 2.2 Modals & Overlays Status

- **Current State**: The application currently uses **in-place conditional transitions** rather than floating modal dialogs.
- **Redesign Recommendations**: Floating modal dialogs can be cleanly introduced using Radix UI / shadcn/ui `<Dialog>` primitives for:
  1. Detailed signal breakdown modal (inspecting ML weights, rule triggers, and fusion math).
  2. Feedback comment modal (collecting optional user explanation on why an assessment was incorrect).
  3. Screenshot full-screen preview lightbox modal.

---

## 3. Communication, State & Handler Contracts (Must Remain Intact)

### 3.1 Network / API Calls

| Endpoint                | Method | Trigger Component / File | Request Payload Shape                                                            | Expected Response Shape                                                                                                                                                         | Redesign Requirement                                                                         |
| ----------------------- | ------ | ------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `/api/v1/analyze/text`  | `POST` | `AnalyzerForm.tsx:56`    | `JSON: { text: string, storeRaw: boolean }`                                      | `{ success: boolean, data: DetectionResultData, error?: { message: string } }`                                                                                                  | Payload keys `text` and `storeRaw` must not change. Must handle non-200 and `!json.success`. |
| `/api/v1/analyze/url`   | `POST` | `AnalyzerForm.tsx:90`    | `JSON: { url: string }`                                                          | `{ success: boolean, data: DetectionResultData, error?: { message: string } }`                                                                                                  | Standalone link analysis contract.                                                           |
| `/api/v1/analyze/image` | `POST` | `AnalyzerForm.tsx:142`   | `FormData: image: File` (multipart)                                              | `{ success: boolean, data: DetectionResultData & { extractedText: string }, error?: { message: string } }`                                                                      | Form data key `image` must match multer/multipart handler on server.                         |
| `/api/v1/feedback`      | `POST` | `ResultCard.tsx:76`      | `JSON: { score: number, verdict: string, category: string, isCorrect: boolean }` | `{ success: boolean }`                                                                                                                                                          | Fire-and-forget best-effort telemetry feedback.                                              |
| `/api/v1/stats`         | `GET`  | `app/stats/page.tsx:23`  | _None_                                                                           | `{ success: boolean, data: { totalScans: number, last24Hours: number, byVerdict: { likely_scam, suspicious, safe }, byCategory: Record<string, number>, degraded?: boolean } }` | Must handle `degraded: true` fallback when database is disconnected.                         |

> [!NOTE]
> **WebSockets / Server-Sent Events (SSE)**: There are currently **no** WebSocket connections or SSE streams in the frontend. All client-server interactions are RESTful JSON/multipart HTTP requests.

---

### 3.2 State Hooks Matrix

| Location             | Hook & Variable                                                  | Type                | Purpose & Lifecycle                                                                                     |
| -------------------- | ---------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------- |
| `app/page.tsx`       | `useState<DetectionResultData \| null>(null)` (`analyzedResult`) | State Object        | Holds current scan result. When `null`, displays `AnalyzerForm`; when populated, displays `ResultCard`. |
| `app/page.tsx`       | `useState<string>('')` (`analyzedText`)                          | String              | Stores the exact text string analyzed to feed into `RedFlagHighlight`.                                  |
| `app/page.tsx`       | `useState<'en' \| 'hi'>('en')` (`lang`)                          | String Union        | Active language selection for UI labels and sample prompts.                                             |
| `AnalyzerForm.tsx`   | `useState<'text' \| 'image' \| 'url'>('text')` (`activeTab`)     | String Union        | Controls active input mode tab in the form.                                                             |
| `AnalyzerForm.tsx`   | `useState('')` (`text`)                                          | String              | Controlled input for the message textarea.                                                              |
| `AnalyzerForm.tsx`   | `useState('')` (`urlInput`)                                      | String              | Controlled input for the URL scanner text input.                                                        |
| `AnalyzerForm.tsx`   | `useState<File \| null>(null)` (`imageFile`)                     | File / null         | Holds selected screenshot file for upload.                                                              |
| `AnalyzerForm.tsx`   | `useState<string \| null>(null)` (`imagePreview`)                | URL String / null   | Object URL created via `URL.createObjectURL` for screenshot thumbnail.                                  |
| `AnalyzerForm.tsx`   | `useState(false)` (`loading`)                                    | Boolean             | Disables form submission and triggers spinner during network calls.                                     |
| `AnalyzerForm.tsx`   | `useState<string \| null>(null)` (`loadingStep`)                 | String / null       | Human-readable progress message displayed during processing.                                            |
| `AnalyzerForm.tsx`   | `useState<string \| null>(null)` (`errorMessage`)                | String / null       | Error text displayed when validation or API fails.                                                      |
| `AnalyzerForm.tsx`   | `useState(false)` (`storeRaw`)                                   | Boolean             | Opt-in sample donation checkbox state.                                                                  |
| `ResultCard.tsx`     | `useState<boolean \| null>(null)` (`feedbackSent`)               | Boolean / null      | Tracks whether user submitted positive (`true`) or negative (`false`) feedback.                         |
| `Quiz.tsx`           | `useState(0)` (`currentIndex`)                                   | Number (0..9)       | Current question pointer in `QUIZ_QUESTIONS`.                                                           |
| `Quiz.tsx`           | `useState<boolean \| null>(null)` (`selectedAnswer`)             | Boolean / null      | Selected answer for current question (`true` = Scam, `false` = Legit).                                  |
| `Quiz.tsx`           | `useState(0)` (`score`)                                          | Number              | Number of questions correctly answered.                                                                 |
| `Quiz.tsx`           | `useState(false)` (`quizFinished`)                               | Boolean             | Flags completion of all 10 questions to render final scorecard.                                         |
| `app/learn/page.tsx` | `useState<'guides' \| 'quiz'>('guides')` (`activeTab`)           | String Union        | Toggles between Guide cards view and Quiz view.                                                         |
| `app/stats/page.tsx` | `useState<StatsData \| null>(null)` (`stats`)                    | State Object / null | Aggregated threat metrics loaded from `/api/v1/stats`.                                                  |
| `app/stats/page.tsx` | `useState(true)` (`loading`)                                     | Boolean             | Loading skeleton state for metric cards.                                                                |
| `app/stats/page.tsx` | `useEffect(() => { ... }, [])`                                   | Effect              | Fetches `/api/v1/stats` once on component mount with degraded-mode catch block.                         |

---

### 3.3 Form & Event Handlers Contract

1. **`handleTextSubmit(e: React.FormEvent)` (`AnalyzerForm.tsx:47`)**:
   - Prevents default form submission.
   - Guard: rejects empty/whitespace text.
   - Sets `loading = true` and `loadingStep`.
   - Sends `POST /api/v1/analyze/text` with `{ text, storeRaw }`.
   - Invokes `onAnalyzeSuccess(json.data, text.trim())` on success.
   - Catches errors and populates `errorMessage`.

2. **`handleUrlSubmit(e: React.FormEvent)` (`AnalyzerForm.tsx:79`)**:
   - Prevents default form submission.
   - Guard: rejects empty URL.
   - Sends `POST /api/v1/analyze/url` with `{ url }`.
   - Invokes `onAnalyzeSuccess(json.data, url.trim())` on success.

3. **`handleImageChange(e: React.ChangeEvent<HTMLInputElement>)` (`AnalyzerForm.tsx:110`)**:
   - Extracts selected file from `e.target.files[0]`.
   - Client-side size guard: checks `file.size <= 5 * 1024 * 1024` (5MB). Rejects oversized images with user alert.
   - Generates object URL via `URL.createObjectURL(file)`.

4. **`handleImageSubmit(e: React.FormEvent)` (`AnalyzerForm.tsx:126`)**:
   - Constructs `FormData` and appends `image`.
   - Sends `POST /api/v1/analyze/image`.
   - Invokes `onAnalyzeSuccess(json.data, json.data.extractedText)` on success.

5. **`handleFeedback(isCorrect: boolean)` (`ResultCard.tsx:73`)**:
   - Sets local `feedbackSent = isCorrect` for instant UI confirmation.
   - Sends non-blocking `POST /api/v1/feedback`.

6. **`handleAnswer(answerIsScam: boolean)` (`Quiz.tsx:144`)**:
   - Idempotency guard: ignores clicks if `selectedAnswer !== null`.
   - Records answer and increments `score` if `answerIsScam === currentQ.isScam`.

7. **`handleNext()` & `handleRestart()` (`Quiz.tsx:153, 162`)**:
   - `handleNext`: Advances `currentIndex` or sets `quizFinished = true` when reaching question 10.
   - `handleRestart`: Resets `currentIndex = 0`, `score = 0`, `selectedAnswer = null`, `quizFinished = false`.

8. **`handleReset()` (`app/page.tsx:20`)**:
   - Resets `analyzedResult = null` and `analyzedText = ''` to return user from result view to the fresh scanner form.

---

## 4. Security & Quality Invariants for Redesign

1. **Defanged Links Only**:
   - Links returned by detection pipelines or typed by users must never be rendered as clickable `<a>` tags pointing to untrusted external URLs. They must always use the defanged representation (e.g. `hxxp://...` with `[.]`).
2. **Safe Highlighting**:
   - User-supplied message text must never pass through `dangerouslySetInnerHTML`. Use safe slicing and `<mark>` elements as done in `RedFlagHighlight.tsx`.
3. **Client Secret Redaction**:
   - When users paste text, `maskClientSecrets` ([apps/web/lib/clientMasking.ts](file:///home/rishi/promptwar/apps/web/lib/clientMasking.ts)) should remain active to scrub OTPs and credit card numbers client-side before sending.
4. **End-to-End Test Selectors**:
   - E2E Playwright tests in `apps/web/__tests__/e2e/scanner.spec.ts` look for:
     - Placeholder text matching `Paste suspicious SMS`
     - Button labeled `Analyze Message`
     - Text containing `Likely Scam` and `/100`
     - Emergency helpline `1930`
   - Any UI redesign should maintain these accessible names or update the test selectors synchronously.
5. **i18n & Multilingual Support**:
   - All string literals in views should map to the JSON message structures in `apps/web/i18n/en.json`, `apps/web/i18n/hi.json`, and `apps/web/i18n/as.json` to allow clean language switching.
