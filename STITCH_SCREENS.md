# Stitch Canvas Design: Full UI Redesign

**Project Name:** Full UI Redesign  
**Stitch Project ID:** `206713362209727463`  
**Canvas URL:** [https://stitch.google.com/projects/206713362209727463](https://stitch.google.com/projects/206713362209727463)  
**Aesthetic:** High-Contrast Dark Monochrome Cyber-Defense (`#090D16` obsidian slate, crisp white typography, `#1E293B` precision borders, with `#EF4444` cyber crimson and `#10B981` neon emerald accents)

---

## Generated Cohesive Screens

| Screen # | Name / Route                                            | Screen ID                          | Direct Canvas Link                                                                                              | Key Preserved Features from UI_AUDIT.md                                                                                                                                                                                                                                                                                               |
| -------- | ------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**    | **Scanner Workspace** (`/`)                             | `2779417ff2ac4cffa3b31e673786ba31` | [View Screen 1](https://stitch.google.com/projects/206713362209727463?node-id=2779417ff2ac4cffa3b31e673786ba31) | 3-tab input (`Paste Message`, `Screenshot OCR`, `Check URL`), 5,000 char counter, realistic sample pills, opt-in checkbox, privacy banner, `1930` cyber helpline badge, and navigation cards.                                                                                                                                         |
| **2**    | **Detection Result & Red Flag View** (`/` result state) | `9a459b7c94a24823a59ef2d06058b2c0` | [View Screen 2](https://stitch.google.com/projects/206713362209727463?node-id=9a459b7c94a24823a59ef2d06058b2c0) | High-contrast glowing crimson verdict banner (`🚨 Likely Scam`, `100/100`), inline highlighted `<mark>` text with risk weights (`+40`, `+35`), itemized red flag cards, defanged link container (`hxxp://...`), brand lookalike spoofing alert (`sbi.co.in`), "What the scammer wants" explainer, and thumbs up/down feedback widget. |
| **3**    | **Learn Center & Threat Guides** (`/learn`)             | `687d8d23282c4e4982a69abbdfc42d19` | [View Screen 3](https://stitch.google.com/projects/206713362209727463?node-id=687d8d23282c4e4982a69abbdfc42d19) | Dual-tab switch (`📚 Guides` / `🎯 Quiz`), 6 comprehensive Indian threat cards (Bank KYC, Electricity Disconnection, UPI QR, Digital Arrest, India Post, Job Tasks) with threat severity badges, real-world examples, and defense checklists.                                                                                         |
| **4**    | **Spot the Scam Quiz** (`/learn?tab=quiz`)              | `2908ae9b19324d40b5f0c8c65a1a9449` | [View Screen 4](https://stitch.google.com/projects/206713362209727463?node-id=2908ae9b19324d40b5f0c8c65a1a9449) | Question progress counter (`1 of 10`), score tracker (`0 / 0`), progress bar, monospace SMS scenario card, binary decision buttons (`🚨 SCAM` vs `🛡️ LEGIT`), instant feedback reveal with key red flags, and "Next Question ➡️" button.                                                                                              |
| **5**    | **Live Threat Telemetry** (`/stats`)                    | `05ce763757944ebbb24b13d1f273e256` | [View Screen 5](https://stitch.google.com/projects/206713362209727463?node-id=05ce763757944ebbb24b13d1f273e256) | Top status badge (`● All messages sanitized in-memory`), 4 KPI cards (Total Analyzed, 24h Blocks, Scam %, Top Vector), horizontal stacked verdict distribution bar, threat category breakdown, and emergency 1930 footer.                                                                                                             |

---

## Stitch CLI Management Commands

```bash
# Open the entire canvas project in your browser
stitch open project 206713362209727463

# Open a specific screen in your browser
stitch open screen 2779417ff2ac4cffa3b31e673786ba31 --project 206713362209727463

# Generate design variants of any screen
stitch generate variants --screen 2779417ff2ac4cffa3b31e673786ba31 --project 206713362209727463 --count 3

# Edit or refine a screen prompt
stitch edit screen 2779417ff2ac4cffa3b31e673786ba31 --project 206713362209727463 --prompt "Make the verdict score badge more prominent"
```
