import modelData from './model.json' with { type: 'json' };

export interface ModelPayload {
  format: string;
  ngram_range: [number, number];
  intercept: number;
  weights: number[];
  vocab: Record<string, { index: number; idf: number }>;
  metrics?: {
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
  };
}

const model: ModelPayload = modelData as unknown as ModelPayload;

export function preprocessText(raw: string): string {
  let text = raw.toLowerCase();
  text = text.replace(/https?:\/\/\S+/g, ' [url] ');
  text = text.replace(/\b\d{10}\b/g, ' [phone] ');
  text = text.replace(/\b\d+\b/g, ' [num] ');
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

export function extractNgrams(text: string): Map<string, number> {
  const tokens = text.split(/\s+/).filter(Boolean);
  const counts = new Map<string, number>();

  // Word unigrams
  for (const token of tokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  // Word bigrams
  for (let i = 0; i < tokens.length - 1; i++) {
    const bigram = `${tokens[i]} ${tokens[i + 1]}`;
    counts.set(bigram, (counts.get(bigram) || 0) + 1);
  }

  return counts;
}

export function sigmoid(z: number): number {
  if (z < -40) return 0;
  if (z > 40) return 1;
  return 1 / (1 + Math.exp(-z));
}

export interface MlInferenceResult {
  probability: number; // 0.0 to 1.0
  score: number; // 0 to 100
  matchedFeatures: Array<{ feature: string; weight: number }>;
}

/**
 * Pure TypeScript inference for Logistic Regression + Sublinear TF-IDF
 */
export function predictSpam(text: string): MlInferenceResult {
  const clean = preprocessText(text);
  const ngramCounts = extractNgrams(clean);

  const matchedFeatures: Array<{ feature: string; weight: number }> = [];
  const sparseVector = new Map<number, number>();

  // Calculate sublinear tf-idf: (1 + ln(count)) * idf
  for (const [ngram, count] of ngramCounts.entries()) {
    const entry = model.vocab[ngram];
    if (entry) {
      const tf = 1 + Math.log(count);
      const tfidf = tf * entry.idf;
      sparseVector.set(entry.index, tfidf);

      const w = model.weights[entry.index] ?? 0;
      if (Math.abs(w) > 0.1) {
        matchedFeatures.push({ feature: ngram, weight: w });
      }
    }
  }

  // L2 normalization
  let sumSq = 0;
  for (const val of sparseVector.values()) {
    sumSq += val * val;
  }
  const norm = sumSq > 0 ? Math.sqrt(sumSq) : 1;

  // Dot product: w^T x + b
  let dot = model.intercept;
  for (const [idx, val] of sparseVector.entries()) {
    const w = model.weights[idx] || 0;
    dot += (val / norm) * w;
  }

  const prob = sigmoid(dot);
  const score = Math.round(prob * 100);

  matchedFeatures.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

  return {
    probability: prob,
    score,
    matchedFeatures: matchedFeatures.slice(0, 10),
  };
}
