# Model Card: ScamShield TF-IDF Logistic Regression v1

## Model Details

- **Architecture**: Sublinear TF-IDF (word unigrams + bigrams) + Logistic Regression (L2 regularization, C=2.0)
- **Model Type**: Binary text classifier (0 = Benign/Ham, 1 = Fraud/Spam)
- **Framework**: Scikit-Learn training -> Pure TypeScript inference engine (zero native dependencies)
- **Export Date**: 2026-11-21

## Quantitative Performance (Held-out Test Split: 20%)

| Metric                | Score |
| --------------------- | ----- |
| **Accuracy**          | 77.3% |
| **Precision**         | 69.2% |
| **Recall**            | 90.0% |
| **F1 Score**          | 78.3% |
| **Evaluated Samples** | 22    |

## Training Data

- Curated Indian Fraud SMS Corpus (`ml/data/indian_scam.csv`): Bank KYC expiry, power cut threats, work-from-home lures, digital arrest extortion, courier fee scams.
- UCI SMS Spam Collection benchmark subset (`ml/data/sms_spam.csv`).

## Intended Use & Integration

- Deployed in `@scamshield/detector` to score unformatted and novel variations of fraudulent messages.
- Feeds into the deterministic Score Fusion engine alongside heuristic regexes and URL domain analyzers.
- Pure-TS runtime executes via dot product and sigmoid in under 1ms.

## Known Limitations & Out-of-Scope Use

- **Adversarial leetspeak / emoji heavy text**: Heavy emoji substitutions may dilute TF-IDF bag-of-words weights. The rule engine and URL analyzer compensate for this.
- **Short fragments**: Texts with fewer than 3 words have sparse features.
- **Guidance only**: Outputs a probability score (0-100) and does not guarantee legal determination of fraud.
