/**
 * The language-identification network the home page runs in the browser.
 *
 * This is the inference half of backend/app/scripts/train_langid.py. The two
 * files share one feature contract, spelled out there and repeated here so a
 * change to either is obviously a change to both:
 *
 *   1. NFC-normalise, lower-case, collapse whitespace, trim, wrap in spaces.
 *   2. Every character n-gram for n = 1, 2, 3 is hashed with FNV-1a 32-bit
 *      over its UTF-8 bytes; bucket = hash % 256.
 *   3. L2-normalise the 256 counts.
 *   4. 256 → 64 (tanh) → 42 (tanh) → 8 (softmax), W stored as [out][in].
 *
 * No dependencies and no GPU: a forward pass is ~20k multiply-adds, which is
 * nothing. The point of running it here rather than on a server is that the
 * visitor can see the activations that produced the answer.
 */

export interface LangLabel {
  code: string;
  name: string;
}

export interface LangLayer {
  name: string;
  activation: "tanh" | "softmax";
  in: number;
  out: number;
  W: number[][];
  b: number[];
}

export interface LangIdModel {
  version: string;
  trained_at: string;
  features: { kind: string; buckets: number; wrap: string; ngrams?: number[] };
  labels: LangLabel[];
  layers: LangLayer[];
  metrics: {
    train_size: number;
    test_size: number;
    test_accuracy: number;
    per_language_accuracy: Record<string, number>;
  };
  examples: { text: string; code: string }[];
}

export interface Prediction {
  /** Input vector first, softmax output last. One entry per layer boundary. */
  activations: Float32Array[];
  probs: Float32Array;
  top: LangLabel & { p: number };
  second: LangLabel & { p: number };
}

const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
const NGRAMS = [1, 2, 3];

export function normalize(text: string): string {
  const cleaned = text.normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim();
  return ` ${cleaned} `;
}

export function fnv1a32(bytes: Uint8Array): number {
  let h = FNV_OFFSET;
  for (let i = 0; i < bytes.length; i++) {
    h ^= bytes[i];
    // Math.imul keeps the multiply in 32-bit space, matching the Python mask.
    h = Math.imul(h, FNV_PRIME) >>> 0;
  }
  return h >>> 0;
}

const encoder = new TextEncoder();

export function featurize(text: string, buckets: number): Float32Array {
  const wrapped = Array.from(normalize(text)); // code points, not UTF-16 units
  const counts = new Float32Array(buckets);
  for (const n of NGRAMS) {
    for (let start = 0; start + n <= wrapped.length; start++) {
      const gram = wrapped.slice(start, start + n).join("");
      counts[fnv1a32(encoder.encode(gram)) % buckets] += 1;
    }
  }
  let sum = 0;
  for (let i = 0; i < counts.length; i++) sum += counts[i] * counts[i];
  const norm = Math.sqrt(sum);
  if (norm > 0) for (let i = 0; i < counts.length; i++) counts[i] /= norm;
  return counts;
}

function dense(layer: LangLayer, x: Float32Array): Float32Array {
  const out = new Float32Array(layer.out);
  for (let o = 0; o < layer.out; o++) {
    const row = layer.W[o];
    let z = layer.b[o];
    for (let i = 0; i < layer.in; i++) z += row[i] * x[i];
    out[o] = z;
  }
  if (layer.activation === "tanh") {
    for (let o = 0; o < out.length; o++) out[o] = Math.tanh(out[o]);
  } else {
    let max = -Infinity;
    for (let o = 0; o < out.length; o++) if (out[o] > max) max = out[o];
    let total = 0;
    for (let o = 0; o < out.length; o++) {
      out[o] = Math.exp(out[o] - max);
      total += out[o];
    }
    for (let o = 0; o < out.length; o++) out[o] /= total;
  }
  return out;
}

export function forward(model: LangIdModel, text: string): Prediction {
  const input = featurize(text, model.features.buckets);
  const activations: Float32Array[] = [input];
  let h = input;
  for (const layer of model.layers) {
    h = dense(layer, h);
    activations.push(h);
  }
  const probs = h;

  let best = 0;
  let runnerUp = -1;
  for (let i = 1; i < probs.length; i++) if (probs[i] > probs[best]) best = i;
  for (let i = 0; i < probs.length; i++) {
    if (i === best) continue;
    if (runnerUp < 0 || probs[i] > probs[runnerUp]) runnerUp = i;
  }

  return {
    activations,
    probs,
    top: { ...model.labels[best], p: probs[best] },
    second: { ...model.labels[runnerUp], p: probs[runnerUp] },
  };
}

/** Plain-language confidence, so the UI never shows a bare probability. */
export function confidenceLabel(p: number): "sure" | "leaning" | "unsure" {
  if (p > 0.8) return "sure";
  if (p > 0.5) return "leaning";
  return "unsure";
}

export async function loadModel(url = "/models/langid-v1.json"): Promise<LangIdModel> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load the language model (${response.status})`);
  return (await response.json()) as LangIdModel;
}
