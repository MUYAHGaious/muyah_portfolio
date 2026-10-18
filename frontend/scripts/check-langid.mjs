// Parity check for the in-browser language model.
//
// Re-implements the forward pass from src/lib/langid.ts in plain Node (the
// TypeScript file cannot be imported without a build step) and runs it over
// the examples bundled in the exported model. Every example must predict its
// own label. Pass extra strings as arguments to print their probabilities and
// compare against `python -m app.scripts.train_langid --check "<text>"`.
//
//   node frontend/scripts/check-langid.mjs
//   node frontend/scripts/check-langid.mjs "ina kwana" "bonjour"

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const model = JSON.parse(readFileSync(join(here, "..", "public", "models", "langid-v1.json"), "utf8"));

const encoder = new TextEncoder();
const NGRAMS = [1, 2, 3];

function fnv1a32(bytes) {
  let h = 0x811c9dc5;
  for (const byte of bytes) {
    h ^= byte;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function featurize(text, buckets) {
  const wrapped = Array.from(` ${text.normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim()} `);
  const counts = new Float64Array(buckets);
  for (const n of NGRAMS) {
    for (let s = 0; s + n <= wrapped.length; s++) {
      counts[fnv1a32(encoder.encode(wrapped.slice(s, s + n).join(""))) % buckets] += 1;
    }
  }
  const norm = Math.hypot(...counts);
  return norm > 0 ? counts.map((c) => c / norm) : counts;
}

function forward(text) {
  let h = featurize(text, model.features.buckets);
  for (const layer of model.layers) {
    const z = layer.W.map((row, o) => row.reduce((acc, w, i) => acc + w * h[i], layer.b[o]));
    if (layer.activation === "tanh") h = z.map(Math.tanh);
    else {
      const max = Math.max(...z);
      const e = z.map((v) => Math.exp(v - max));
      const sum = e.reduce((a, b) => a + b, 0);
      h = e.map((v) => v / sum);
    }
  }
  return h;
}

const args = process.argv.slice(2);
if (args.length > 0) {
  for (const text of args) {
    const probs = forward(text);
    console.log(`\n"${text}"`);
    [...probs.keys()]
      .sort((a, b) => probs[b] - probs[a])
      .forEach((i) => console.log(`  ${model.labels[i].code}  ${probs[i].toFixed(6)}`));
  }
} else {
  let failures = 0;
  for (const { text, code } of model.examples) {
    const probs = forward(text);
    const best = probs.indexOf(Math.max(...probs));
    const got = model.labels[best].code;
    const ok = got === code;
    if (!ok) failures++;
    console.log(`${ok ? "ok  " : "FAIL"} ${code} -> ${got} ${probs[best].toFixed(3)}  "${text}"`);
  }
  console.log(`\n${model.examples.length - failures}/${model.examples.length} examples correct; ` +
    `held-out accuracy ${model.metrics.test_accuracy}`);
  process.exit(failures ? 1 : 0);
}
