# ScamShield — API Reference

## Base URL

```
https://scamshield.example.com/api
```

## Endpoints

### `POST /api/analyze`

Analyzes a text message for scam signals.

**Request Body**

```json
{
  "text": "string (1–5000 chars, required)",
  "enableAi": "boolean (optional, default: false)"
}
```

**Response `200`**

```json
{
  "verdict": "safe | suspicious | likely_scam",
  "score": 0,
  "category": "bank_kyc | upi_payment | ...",
  "redFlags": [
    {
      "id": "string",
      "signal": "string",
      "snippet": "string",
      "reason": "string",
      "weight": 0,
      "startIndex": 0,
      "endIndex": 10
    }
  ],
  "signals": [
    {
      "id": "string",
      "matched": true,
      "weight": 0,
      "evidence": "string"
    }
  ],
  "urlAnalysis": {
    "url": "string",
    "defanged": "string",
    "riskScore": 0,
    "flags": [],
    "isShortener": false,
    "hasIpHost": false,
    "hasRiskyTld": false
  },
  "ruleScore": 0,
  "fusionDetails": {
    "ruleScore": 0,
    "mlScore": 0,
    "urlScore": 0,
    "aiNudge": 0,
    "finalScore": 0,
    "formula": "0.5*rule + 0.3*ml + 0.15*url + 0.05*ai"
  }
}
```

**Error Responses**

| Status | Description           |
| ------ | --------------------- |
| `400`  | Invalid request body  |
| `429`  | Rate limit exceeded   |
| `500`  | Internal server error |

## Rate Limits

- 100 requests / minute per IP (default)
- Configurable via `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS` env vars
