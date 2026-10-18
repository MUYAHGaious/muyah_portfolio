"""Train the tiny language-identification network shown on the home page.

The site's hero renders a real multilayer perceptron and runs it in the
visitor's browser. This script trains that network offline and exports its
weights to ``frontend/public/models/langid-v1.json``; the TypeScript forward
pass in ``frontend/src/lib/langid.ts`` mirrors the maths here exactly, so the
feature contract below is the thing to keep in sync.

Feature contract
----------------
* text -> ``unicodedata.normalize("NFC", text).lower()``, whitespace collapsed
  to single spaces, stripped, then wrapped as ``" " + text + " "``.
* every character n-gram for n in 1, 2, 3 of the wrapped string is hashed with
  FNV-1a 32-bit over the n-gram's UTF-8 bytes; bucket = hash % 256.
* the 256 bucket counts are L2-normalised (all zeros stay zeros).

Architecture: 256 -> 64 (tanh) -> 42 (tanh) -> 8 (softmax). W is stored
row-major as [out][in] so y = act(W @ x + b).

Run with:  python -m app.scripts.train_langid
           python -m app.scripts.train_langid --check "ina kwana"
Requires numpy (listed in requirements-dev.txt; training is offline only).
"""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from datetime import date
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
DATA_DIR = HERE / "langid_data"
EXPORT = HERE.parents[2] / "frontend" / "public" / "models" / "langid-v1.json"

LABELS = [
    ("ha", "Hausa"),
    ("yo", "Yoruba"),
    ("sw", "Swahili"),
    ("ig", "Igbo"),
    ("am", "Amharic"),
    ("fr", "French"),
    ("en", "English"),
    ("es", "Spanish"),
]

BUCKETS = 256
NGRAMS = (1, 2, 3)
HIDDEN = (64, 42)
SEED = 7

FNV_OFFSET = 2166136261
FNV_PRIME = 16777619
MASK32 = 0xFFFFFFFF

_WS = re.compile(r"\s+")


# ------------------------------------------------------------------ features


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFC", text).lower()
    text = _WS.sub(" ", text).strip()
    return f" {text} "


def fnv1a32(data: bytes) -> int:
    h = FNV_OFFSET
    for byte in data:
        h ^= byte
        h = (h * FNV_PRIME) & MASK32
    return h


def featurize(text: str) -> np.ndarray:
    wrapped = normalize(text)
    counts = np.zeros(BUCKETS, dtype=np.float64)
    for n in NGRAMS:
        for start in range(len(wrapped) - n + 1):
            gram = wrapped[start : start + n]
            counts[fnv1a32(gram.encode("utf-8")) % BUCKETS] += 1.0
    norm = np.linalg.norm(counts)
    return counts / norm if norm > 0 else counts


# ---------------------------------------------------------------------- data


def load_dataset() -> tuple[list[str], np.ndarray, np.ndarray]:
    texts: list[str] = []
    labels: list[int] = []
    for index, (code, _) in enumerate(LABELS):
        seen: set[str] = set()
        lines: list[str] = []
        for path in sorted(DATA_DIR.glob(f"{code}*.txt")):
            lines.extend(path.read_text(encoding="utf-8").splitlines())
        for line in lines:
            line = line.strip()
            if not line or line in seen:
                continue
            seen.add(line)
            texts.append(line)
            labels.append(index)
    x = np.stack([featurize(t) for t in texts])
    return texts, x, np.asarray(labels)


def stratified_split(y: np.ndarray, rng: np.random.Generator, test_frac: float = 0.15):
    train_idx: list[int] = []
    test_idx: list[int] = []
    for cls in np.unique(y):
        members = np.flatnonzero(y == cls)
        rng.shuffle(members)
        cut = max(1, int(round(len(members) * test_frac)))
        test_idx.extend(members[:cut].tolist())
        train_idx.extend(members[cut:].tolist())
    return np.asarray(train_idx), np.asarray(test_idx)


# --------------------------------------------------------------------- model


class MLP:
    def __init__(self, sizes: list[int], rng: np.random.Generator):
        self.W: list[np.ndarray] = []
        self.b: list[np.ndarray] = []
        for fan_in, fan_out in zip(sizes, sizes[1:]):
            limit = np.sqrt(6.0 / (fan_in + fan_out))
            self.W.append(rng.uniform(-limit, limit, size=(fan_out, fan_in)))
            self.b.append(np.zeros(fan_out))

    def forward(self, x: np.ndarray) -> list[np.ndarray]:
        """Returns every layer's activation, input first, softmax last."""
        acts = [x]
        h = x
        last = len(self.W) - 1
        for i, (w, b) in enumerate(zip(self.W, self.b)):
            z = h @ w.T + b
            h = softmax(z) if i == last else np.tanh(z)
            acts.append(h)
        return acts

    def params(self):
        return self.W + self.b


def softmax(z: np.ndarray) -> np.ndarray:
    z = z - z.max(axis=-1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=-1, keepdims=True)


def train(
    model: MLP,
    x: np.ndarray,
    y: np.ndarray,
    rng: np.random.Generator,
    epochs: int = 400,
    batch: int = 64,
    lr: float = 0.004,
    weight_decay: float = 6e-4,
) -> None:
    """Adam on cross-entropy with a little L2. Plain, deterministic, fast."""
    n = len(x)
    classes = len(model.b[-1])
    params = model.params()
    m = [np.zeros_like(p) for p in params]
    v = [np.zeros_like(p) for p in params]
    beta1, beta2, eps = 0.9, 0.999, 1e-8
    step = 0

    for epoch in range(epochs):
        order = rng.permutation(n)
        for start in range(0, n, batch):
            idx = order[start : start + batch]
            xb, yb = x[idx], y[idx]
            acts = model.forward(xb)

            target = np.zeros((len(idx), classes))
            target[np.arange(len(idx)), yb] = 1.0
            delta = (acts[-1] - target) / len(idx)

            grads_W: list[np.ndarray] = []
            grads_b: list[np.ndarray] = []
            for layer in range(len(model.W) - 1, -1, -1):
                grads_W.append(delta.T @ acts[layer] + weight_decay * model.W[layer])
                grads_b.append(delta.sum(axis=0))
                if layer > 0:
                    delta = (delta @ model.W[layer]) * (1.0 - acts[layer] ** 2)
            grads = grads_W[::-1] + grads_b[::-1]

            step += 1
            for p, g, mi, vi in zip(params, grads, m, v):
                mi[...] = beta1 * mi + (1 - beta1) * g
                vi[...] = beta2 * vi + (1 - beta2) * g * g
                m_hat = mi / (1 - beta1**step)
                v_hat = vi / (1 - beta2**step)
                p -= lr * m_hat / (np.sqrt(v_hat) + eps)

        if (epoch + 1) % 50 == 0:
            probs = model.forward(x)[-1]
            loss = -np.log(probs[np.arange(n), y] + 1e-12).mean()
            acc = (probs.argmax(axis=1) == y).mean()
            print(f"epoch {epoch + 1:4d}  loss {loss:.4f}  train acc {acc:.3f}")


# -------------------------------------------------------------------- export


def evaluate(model: MLP, x: np.ndarray, y: np.ndarray) -> tuple[float, dict[str, float], np.ndarray]:
    pred = model.forward(x)[-1].argmax(axis=1)
    per_lang = {}
    for index, (code, _) in enumerate(LABELS):
        mask = y == index
        per_lang[code] = float((pred[mask] == index).mean()) if mask.any() else float("nan")
    confusion = np.zeros((len(LABELS), len(LABELS)), dtype=int)
    for truth, guess in zip(y, pred):
        confusion[truth, guess] += 1
    return float((pred == y).mean()), per_lang, confusion


def export(model: MLP, metrics: dict, examples: list[dict]) -> None:
    def rounded(arr: np.ndarray) -> list:
        return np.round(arr, 5).tolist()

    sizes = [BUCKETS, *HIDDEN, len(LABELS)]
    names = ["h1", "h2", "out"]
    layers = []
    for i, (w, b) in enumerate(zip(model.W, model.b)):
        layers.append(
            {
                "name": names[i],
                "activation": "softmax" if i == len(model.W) - 1 else "tanh",
                "in": sizes[i],
                "out": sizes[i + 1],
                "W": rounded(w),
                "b": rounded(b),
            }
        )

    payload = {
        "version": "langid-v1",
        "trained_at": date.today().isoformat(),
        "features": {"kind": "char-ngram-fnv1a32", "ngrams": list(NGRAMS), "buckets": BUCKETS, "wrap": " "},
        "labels": [{"code": code, "name": name} for code, name in LABELS],
        "layers": layers,
        "metrics": metrics,
        "examples": examples,
    }
    EXPORT.parent.mkdir(parents=True, exist_ok=True)
    EXPORT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {EXPORT} ({EXPORT.stat().st_size / 1024:.0f} KB)")


def load_exported() -> MLP:
    data = json.loads(EXPORT.read_text(encoding="utf-8"))
    model = MLP.__new__(MLP)
    model.W = [np.asarray(layer["W"]) for layer in data["layers"]]
    model.b = [np.asarray(layer["b"]) for layer in data["layers"]]
    return model


# ---------------------------------------------------------------------- main


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", metavar="TEXT", help="Classify TEXT with the exported model.")
    parser.add_argument("--epochs", type=int, default=300)
    args = parser.parse_args()

    if args.check is not None:
        model = load_exported()
        probs = model.forward(featurize(args.check)[None, :])[-1][0]
        for index in np.argsort(-probs):
            print(f"{LABELS[index][0]}  {probs[index]:.6f}")
        return

    rng = np.random.default_rng(SEED)
    texts, x, y = load_dataset()
    train_idx, test_idx = stratified_split(y, rng)
    print(f"{len(texts)} phrases, {len(train_idx)} train / {len(test_idx)} test")

    model = MLP([BUCKETS, *HIDDEN, len(LABELS)], rng)
    train(model, x[train_idx], y[train_idx], rng, epochs=args.epochs)

    accuracy, per_lang, confusion = evaluate(model, x[test_idx], y[test_idx])
    print(f"\nheld-out accuracy {accuracy:.3f}")
    for code, acc in per_lang.items():
        print(f"  {code}  {acc:.3f}")
    print("\nconfusion (rows = truth, cols = prediction)")
    print("    " + " ".join(f"{c:>4}" for c, _ in LABELS))
    for i, (code, _) in enumerate(LABELS):
        print(f"{code:>4}" + " ".join(f"{n:>4}" for n in confusion[i]))

    # Two short held-out examples per language, used by the hero's idle demo
    # and by the Node parity check.
    # Two short held-out examples per language that the model gets right with
    # confidence, so the idle demo shows the network working rather than guessing.
    probs_test = model.forward(x[test_idx])[-1]
    examples: list[dict] = []
    for index, (code, _) in enumerate(LABELS):
        picks = [
            i
            for pos, i in enumerate(test_idx)
            if y[i] == index and probs_test[pos].argmax() == index and probs_test[pos][index] >= 0.85
        ]
        picks.sort(key=lambda i: (len(texts[i]) < 10, len(texts[i])))
        for i in picks[:2]:
            examples.append({"text": texts[i], "code": code})

    export(
        model,
        {
            "train_size": int(len(train_idx)),
            "test_size": int(len(test_idx)),
            "test_accuracy": round(accuracy, 4),
            "per_language_accuracy": {k: round(v, 4) for k, v in per_lang.items()},
        },
        examples,
    )


if __name__ == "__main__":
    main()
