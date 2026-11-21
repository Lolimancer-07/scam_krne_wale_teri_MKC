# ScamShield — OpenAPI & REST API Specification 🛡️

## Base URL

Production: `https://scamshield.example.com/api/v1`  
Local: `http://localhost:3000/api/v1`

Every response includes:

- `X-Request-Id`: Unique UUID correlation ID
- Standard JSON envelope: `{ "requestId": string, "success": boolean, "data"?: object, "error"?: object }`

---

## Endpoints Summary

| Method | Endpoint         | Description                                        | Rate Limit    |
| ------ | ---------------- | -------------------------------------------------- | ------------- |
| `POST` | `/analyze/text`  | Analyze raw SMS / WhatsApp / email text            | 30 req / min  |
| `POST` | `/analyze/image` | Multipart screenshot upload + OCR (Eng + Hin)      | 10 req / min  |
| `POST` | `/analyze/url`   | Check direct link for brand lookalike / homographs | 20 req / min  |
| `POST` | `/feedback`      | Submit user accuracy feedback on a verdict         | 20 req / min  |
| `GET`  | `/stats`         | Public aggregated anonymous statistics             | 100 req / min |
| `GET`  | `/health`        | Liveness check (JSON status ok)                    | Unlimited     |
| `GET`  | `/ready`         | Readiness check (database & services ready)        | Unlimited     |

---

## 1. POST /analyze/text

Analyzes a raw text message for fraud signals, lookalike URLs, and ML likelihood.

### Request Body (`application/json`)

```json
{
  "text": "Dear Customer, your SBI KYC expires today, verify via http://sbi-kyc-update.xyz or account will be blocked",
  "enableAi": false,
  "storeRaw": false
}
```

### Response (`200 OK`)

```json
{
  "requestId": "9c1b4892-25e1-4541-b847-a4ea2d8803fb",
  "success": true,
  "data": {
    "verdict": "likely_scam",
    "score": 100,
    "category": "bank_kyc",
    "redFlags": [
      {
        "id": "impersonated_brand-20",
        "signal": "impersonated_brand",
        "snippet": "SBI",
        "reason": "References prominent banks, government agencies, utilities, or courier services.",
        "weight": 20
      },
      {
        "id": "kyc_lure-27",
        "signal": "kyc_lure",
        "snippet": "KYC expires today, verify via http://sbi-kyc-update",
        "reason": "Claims KYC or documents are expired, incomplete, or blocked to create panic.",
        "weight": 40
      },
      {
        "id": "account_block_threat-78",
        "signal": "account_block_threat",
        "snippet": "account will be blocked",
        "reason": "Threatens that your bank account, SIM card, or utility will be suspended or disconnected.",
        "weight": 35
      }
    ],
    "signals": [
      { "id": "kyc_lure", "matched": true, "weight": 40, "evidence": "KYC expires today" },
      {
        "id": "account_block_threat",
        "matched": true,
        "weight": 35,
        "evidence": "account will be blocked"
      }
    ],
    "urlAnalysis": {
      "url": "http://sbi-kyc-update.xyz",
      "defanged": "hxxp://sbi-kyc-update[.]xyz",
      "riskScore": 85,
      "flags": ["risky_tld", "brand_impersonation", "insecure_http"],
      "isShortener": false,
      "hasIpHost": false,
      "hasRiskyTld": true,
      "lookalikeBrand": "sbi",
      "lookalikeDomain": "sbi.co.in"
    },
    "mlScore": 82,
    "ruleScore": 95,
    "fusionDetails": {
      "ruleScore": 95,
      "mlScore": 82,
      "urlScore": 85,
      "aiNudge": 0,
      "finalScore": 100,
      "formula": "0.50*rules + 0.30*ml + 0.20*url + aiNudge"
    },
    "analysisId": "cm3r812900010v8192837482",
    "ai": {
      "category": "bank_kyc",
      "explanation": "This message impersonates your bank (Canara/SBI) and claims your KYC is expiring to pressure you into clicking a lookalike portal.",
      "recommended_actions": [
        "Do not click any links in the message",
        "Verify through the bank's official app or website",
        "Report suspected phishing at cybercrime.gov.in"
      ],
      "confidence": 0.87,
      "nudge": 8,
      "source": "claude"
    }
  }
}
```

### Response fields

- `analysisId`: Database correlation ID for the analysis (used by `/feedback`).
- `ai`: Optional plain-language explanation, present only when `enableAi` was
  requested and the optional AI layer was available (falls back to a
  template-based explanation with `source: "fallback_template"` when AI is
  disabled or unconfigured). The AI never decides the verdict — the verdict and
  score always come from the deterministic fusion above. The advisory nudge is
  clamped to `[-10, +10]`.

---

## 2. POST /analyze/image

Multipart form upload of SMS / WhatsApp screenshot. Extracts English & Hindi text via Tesseract OCR worker before classification.

### Request Body (`multipart/form-data`)

- `image`: Binary file (`image/png`, `image/jpeg`, `image/webp` up to 5MB)

### Response (`200 OK`)

```json
{
  "requestId": "d82194a2-1402-4299-8cfb-6f4812a02b11",
  "success": true,
  "data": {
    "extractedText": "प्रिय ग्राहक, आपका एसबीआई खाता केवाईसी समाप्त हो गया है...",
    "verdict": "likely_scam",
    "score": 92,
    "category": "bank_kyc"
  }
}
```

---

## 3. POST /analyze/url

Directly analyzes a link without fetching it over the network (SSRF immune).

### Request Body (`application/json`)

```json
{
  "url": "http://sbi-verification.xyz"
}
```

### Response (`200 OK`)

```json
{
  "requestId": "a4901f41-0f49-411a-8291-01f492810a92",
  "success": true,
  "data": {
    "verdict": "likely_scam",
    "score": 85,
    "category": "bank_kyc",
    "urlAnalysis": {
      "url": "http://sbi-verification.xyz",
      "defanged": "hxxp://sbi-verification[.]xyz",
      "riskScore": 85,
      "flags": ["brand_impersonation", "risky_tld"],
      "lookalikeBrand": "sbi",
      "lookalikeDomain": "sbi.co.in"
    }
  }
}
```

---

## 4. POST /feedback

Submits anonymous user validation regarding whether an analysis was accurate.

### Request Body (`application/json`)

```json
{
  "analysisId": "cm3r812900010v8192837482",
  "isCorrect": true,
  "verdict": "likely_scam",
  "score": 100,
  "category": "bank_kyc",
  "comment": "Accurately flagged fake SBI message"
}
```

### Response (`201 Created`)

```json
{
  "requestId": "48921a40-2810-4119-9021-029182901a11",
  "success": true,
  "data": {
    "saved": true,
    "message": "Thank you for helping improve ScamShield accuracy"
  }
}
```

---

## 5. GET /stats

Returns public anonymous aggregation of messages scanned and top categories.

### Response (`200 OK`)

```json
{
  "requestId": "1049281a-9821-4110-8201-901829182a01",
  "success": true,
  "data": {
    "totalScans": 12480,
    "last24Hours": 342,
    "byVerdict": {
      "likely_scam": 7820,
      "suspicious": 2840,
      "safe": 1820
    },
    "byCategory": {
      "bank_kyc": 4520,
      "electricity_bill": 2180,
      "otp_impersonation": 1940,
      "job_task": 1420
    }
  }
}
```

---

## 6. Standard Error Format

```json
{
  "requestId": "81928374-1234-5678-abcd-019283746521",
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Message text exceeds the 5,000 character limit",
    "details": {}
  }
}
```
