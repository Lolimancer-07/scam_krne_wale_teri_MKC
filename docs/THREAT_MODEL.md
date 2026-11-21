# ScamShield — Threat Model

## Scope

This document covers threats to ScamShield users and the platform itself.

## Attacker Profiles

| Profile          | Goal                                     |
| ---------------- | ---------------------------------------- |
| Scammer          | Bypass detection, continue sending scams |
| Automated tester | Probe detection boundaries via API       |
| Data harvester   | Extract submitted message content        |

## Scam Categories Targeted

| Category            | Example Pattern                           |
| ------------------- | ----------------------------------------- |
| `bank_kyc`          | "Your KYC is incomplete, click to update" |
| `upi_payment`       | "Collect ₹5000 UPI prize"                 |
| `delivery_courier`  | "Your parcel is held, pay customs"        |
| `government_tax`    | "Income Tax refund — provide account"     |
| `lottery_prize`     | "You've won a lottery"                    |
| `job_task`          | "Part-time job, earn ₹500/task"           |
| `otp_impersonation` | "Share OTP with bank officer"             |
| `investment_crypto` | "Guaranteed 10x crypto returns"           |

## Mitigations

- **Rate limiting**: Redis-backed, per-IP rate limits on `/api/analyze`
- **Input sanitization**: Zod schema validation, max 5000 chars
- **No PII storage**: Text inputs are not stored by default
- **URL defanging**: Extracted URLs are defanged before display
- **AI sandboxing**: Claude prompts are templated, no raw user input interpolation

## Out of Scope

- Image scam detection (future: Tesseract OCR integration planned)
- Real-time SMS interception
- Blocking at carrier level
