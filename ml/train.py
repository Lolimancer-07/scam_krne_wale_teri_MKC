#!/usr/bin/env python3
"""
ScamShield ML Offline Training Script
Trains a TF-IDF + Logistic Regression classifier on UCI SMS Spam + Curated Indian Scam datasets.
Exports weights, vocabulary, and model card for pure TypeScript inference.
"""

import json
import os
import re
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split

ROOT_DIR = Path(__file__).resolve().parent
DATA_DIR = ROOT_DIR / "data"
MODEL_DIR = ROOT_DIR / "model"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


def load_datasets():
    dfs = []
    indian_path = DATA_DIR / "indian_scam.csv"
    if indian_path.exists():
        df_ind = pd.read_csv(indian_path)
        dfs.append(df_ind)
        print(f"Loaded {len(df_ind)} samples from {indian_path.name}")

    sms_path = DATA_DIR / "sms_spam.csv"
    if sms_path.exists():
        df_sms = pd.read_csv(sms_path)
        dfs.append(df_sms)
        print(f"Loaded {len(df_sms)} samples from {sms_path.name}")

    if not dfs:
        raise FileNotFoundError("No dataset files found in ml/data/")

    df = pd.concat(dfs, ignore_index=True)
    df["label"] = df["label"].str.strip().str.lower()
    df["target"] = (df["label"] == "spam").astype(int)
    print(f"Total dataset: {len(df)} samples ({df['target'].sum()} spam, {len(df) - df['target'].sum()} ham)")
    return df


def preprocess(text: str) -> str:
    # Lowercase and normalize whitespace
    text = text.lower()
    text = re.sub(r"https?://\S+", " [URL] ", text)
    text = re.sub(r"\b\d{10}\b", " [PHONE] ", text)
    text = re.sub(r"\b\d+\b", " [NUM] ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def train():
    df = load_datasets()
    df["clean_text"] = df["text"].astype(str).apply(preprocess)

    X_train, X_test, y_train, y_test = train_test_split(
        df["clean_text"], df["target"], test_size=0.20, random_state=42, stratify=df["target"]
    )

    print(f"Train size: {len(X_train)}, Test size: {len(X_test)}")

    # Extract word (1-2) and selected char n-grams
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        min_df=1,
        max_features=800,
        sublinear_tf=True,
        norm="l2",
    )

    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # Train Logistic Regression
    clf = LogisticRegression(C=2.0, max_iter=1000, random_state=42)
    clf.fit(X_train_vec, y_train)

    y_pred = clf.predict(X_test_vec)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)

    print("\n--- Evaluation on Held-Out Test Set (20%) ---")
    print(f"Accuracy:  {acc * 100:.2f}%")
    print(f"Precision: {prec * 100:.2f}%")
    print(f"Recall:    {rec * 100:.2f}%")
    print(f"F1 Score:  {f1 * 100:.2f}%")
    print("\nClassification Report:\n", classification_report(y_test, y_pred, target_names=["ham", "spam"]))

    # Prepare exportable model representation
    vocab_dict = {}
    for feature, idx in vectorizer.vocabulary_.items():
        vocab_dict[feature] = {
            "index": int(idx),
            "idf": float(vectorizer.idf_[idx]),
        }

    weights_list = clf.coef_[0].tolist()
    intercept = float(clf.intercept_[0])

    model_payload = {
        "format": "scamshield-tfidf-lr-v1",
        "ngram_range": [1, 2],
        "intercept": intercept,
        "weights": weights_list,
        "vocab": vocab_dict,
        "metrics": {
            "accuracy": float(acc),
            "precision": float(prec),
            "recall": float(rec),
            "f1": float(f1),
            "test_samples": len(y_test),
        },
    }

    # Save to JSON
    weights_path = MODEL_DIR / "weights.json"
    vocab_path = MODEL_DIR / "vocab.json"
    model_path = MODEL_DIR / "model.json"

    with open(weights_path, "w") as f:
        json.dump({"intercept": intercept, "weights": weights_list}, f, indent=2)

    with open(vocab_path, "w") as f:
        json.dump(vocab_dict, f, indent=2)

    with open(model_path, "w") as f:
        json.dump(model_payload, f, indent=2)

    print(f"Exported model to {model_path} ({len(weights_list)} features)")

    # Also copy model.json into detector package for pure-TS inference
    detector_model_dest = ROOT_DIR.parent / "packages" / "detector" / "src" / "ml" / "model.json"
    detector_model_dest.parent.mkdir(parents=True, exist_ok=True)
    with open(detector_model_dest, "w") as f:
        json.dump(model_payload, f)
    print(f"Copied runtime model to {detector_model_dest}")

    # Generate Model Card
    card_path = ROOT_DIR / "MODEL_CARD.md"
    card_content = f"""# Model Card: ScamShield TF-IDF Logistic Regression v1

## Model Details
- **Architecture**: Sublinear TF-IDF (word unigrams + bigrams) + Logistic Regression (L2 regularization, C=2.0)
- **Model Type**: Binary text classifier (0 = Benign/Ham, 1 = Fraud/Spam)
- **Framework**: Scikit-Learn training -> Pure TypeScript inference engine (zero native dependencies)
- **Export Date**: 2026-11-21

## Quantitative Performance (Held-out Test Split: 20%)

| Metric | Score |
|---|---|
| **Accuracy** | {acc * 100:.1f}% |
| **Precision** | {prec * 100:.1f}% |
| **Recall** | {rec * 100:.1f}% |
| **F1 Score** | {f1 * 100:.1f}% |
| **Evaluated Samples** | {len(y_test)} |

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
"""
    with open(card_path, "w") as f:
        f.write(card_content)
    print(f"Generated Model Card at {card_path}")


if __name__ == "__main__":
    train()

