"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AgentPop } from "@/components/network/AgentPop";
import type { FieldActivations, FieldEvent, NeuronInfo } from "@/components/network/NeuralField";
import { RunSounds } from "@/components/network/sounds";
import {
  supportsWebGL,
  useLangModel,
  usePrefersReducedMotion,
} from "@/components/network/useLangModel";
import { confidenceLabel, forward, type LangIdModel, type Prediction } from "@/lib/langid";

const NeuralField = dynamic(
  () => import("@/components/network/NeuralField").then((m) => m.NeuralField),
  { ssr: false },
);

/**
 * The network as an instrument on the bench.
 *
 * Docked (default): a framed panel of fixed height with its controls on it.
 * Sentence chips, the text field and Play along the top; the answer, the
 * running caption, sound, zoom and "open the bench" along the bottom. The
 * whole network fits the frame.
 *
 * Bench: the full-size view. Very large, scrolls sideways on a desktop,
 * vertical on a phone, with the live log and the legend. Same renderer, same
 * model, same state; only the frame changes.
 */
const ZOOM_STEPS = [1, 1.5, 2.2, 3.2];

function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setNarrow(mq.matches);
    const onChange = () => setNarrow(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return narrow;
}

export function NetworkBench({ className = "" }: { className?: string }) {
  const { model, error } = useLangModel();
  const reducedMotion = usePrefersReducedMotion();
  const narrow = useNarrow();
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [mode, setMode] = useState<"docked" | "bench">("docked");
  const [text, setText] = useState("");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [activations, setActivations] = useState<FieldActivations | null>(null);
  const [replayKey, setReplayKey] = useState(0);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [inspected, setInspected] = useState<NeuronInfo | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [conclusion, setConclusion] = useState<Conclusion | null>(null);
  const [muted, setMuted] = useState(false);
  const soundsRef = useRef<RunSounds | null>(null);
  if (!soundsRef.current) soundsRef.current = new RunSounds();

  useEffect(() => {
    try {
      if (localStorage.getItem("network-muted") === "1") setMuted(true);
    } catch {
      /* storage may be unavailable */
    }
  }, []);
  useEffect(() => {
    soundsRef.current!.muted = muted;
    try {
      localStorage.setItem("network-muted", muted ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [muted]);
  const keyRef = useRef(0);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => setWebgl(supportsWebGL()), []);

  const run = useCallback(
    (value: string) => {
      if (!model) return;
      const trimmed = value.trim();
      if (!trimmed) {
        setPrediction(null);
        setActivations(null);
        return;
      }
      const result = forward(model, trimmed);
      keyRef.current += 1;
      setPrediction(result);
      setActivations({ layers: result.activations, key: keyRef.current });
    },
    [model],
  );

  // Start with one example already answered so the frame is never blank.
  useEffect(() => {
    if (!model || text) return;
    const first = model.examples[0];
    if (first) {
      setText(first.text);
      run(first.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  // Play once on arrival, as soon as the frame is on screen, so the visitor
  // sees the network think without having to find the button first.
  const autoplayed = useRef(false);
  useEffect(() => {
    if (!model || !activations || autoplayed.current || reducedMotion) return;
    const node = frameRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || autoplayed.current) return;
        autoplayed.current = true;
        observer.disconnect();
        window.setTimeout(() => setReplayKey((k) => k + 1), 600);
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [model, activations, reducedMotion]);

  function send(value: string) {
    soundsRef.current?.unlock();
    setConclusion(null);
    run(value);
    setReplayKey((k) => k + 1);
    if (mode === "bench") {
      frameRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    }
  }

  function tryExample(value: string) {
    setText(value);
    send(value);
  }

  function play() {
    send(text);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      play();
    }
  }

  function toggleMode() {
    const next = mode === "docked" ? "bench" : "docked";
    setMode(next);
    setZoomIndex(0);
    setInspected(null);
    requestAnimationFrame(() => {
      frameRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
  }

  const accuracy = model ? Math.round(model.metrics.test_accuracy * 100) : null;
  const confidence = prediction ? confidenceLabel(prediction.top.p) : null;
  const verdict = useMemo(() => {
    if (!prediction) return null;
    if (confidence === "sure") return prediction.top.name;
    if (confidence === "leaning") return `probably ${prediction.top.name}`;
    return `${prediction.top.name}, or maybe ${prediction.second.name}`;
  }, [prediction, confidence]);

  const zoom = ZOOM_STEPS[zoomIndex];
  const onInspect = useCallback((info: NeuronInfo | null) => setInspected(info), []);
  const onProgress = useCallback((line: string | null) => setCaption(line), []);
  const onEvent = useCallback(
    (event: FieldEvent) => {
      const sounds = soundsRef.current!;
      if (event.kind === "input") sounds.click();
      else if (event.kind === "hidden") sounds.tick(event.value);
      else if (event.kind === "output") sounds.ping(event.value);
      else if (event.kind === "done") {
        sounds.win();
        setConclusion(summarise(model, prediction, event.winner, event.probability));
      }
    },
    [model, prediction],
  );
  const onLog = useCallback((line: string | null) => {
    if (line === null) setLog([]);
    else setLog((lines) => [...lines.slice(-9), line]);
  }, []);

  const bench = mode === "bench";
  const vertical = narrow;

  const field = model && webgl && (
    <NeuralField
      model={model}
      activations={activations}
      zoom={zoom}
      replayKey={replayKey}
      reducedMotion={reducedMotion}
      orientation={vertical ? "vertical" : "horizontal"}
      onInspect={onInspect}
      onProgress={onProgress}
      onLog={onLog}
      onEvent={onEvent}
      className="h-full w-full"
    />
  );

  return (
    <section
      ref={frameRef}
      aria-label="A small neural network you can run"
      className={`relative scroll-mt-24 overflow-hidden rounded-[var(--r-lg)] border border-line bg-[#0b1230] ${className}`}
    >
      {/* Top bar: what it is, then the controls. */}
      <div className="border-b border-line bg-ground/60 px-3 py-3 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <p className="font-mono text-micro text-ink-soft">
            <span className="text-ink">langid-v1</span> · a real network I trained · 8 languages
            {accuracy !== null && ` · ${accuracy}% right on new sentences`}
          </p>
          <p className="font-mono text-micro text-ink-faint">runs in your browser</p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {model &&
            examplesToShow(model).map((example) => (
              <button
                key={example.text}
                type="button"
                onClick={() => tryExample(example.text)}
                aria-pressed={text === example.text}
                className={`rounded-md border px-2.5 py-1 text-small transition-colors ${
                  text === example.text
                    ? "border-ember bg-ember-tint text-ink"
                    : "border-field text-ink-soft hover:border-ember hover:text-ink"
                }`}
              >
                {example.text}
              </button>
            ))}
          <div className="flex min-w-[14rem] flex-1 items-stretch gap-2">
            <input
              id="langid"
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder={model ? "or type a sentence, then Enter" : error ? "the model could not load" : "loading the model"}
              aria-label={model ? "Your sentence (langid-v1)" : "Your sentence"}
              autoComplete="off"
              spellCheck={false}
              disabled={!model}
              className="min-h-10 w-full flex-1 rounded-md border border-field bg-ground/70 px-3 text-small text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ember disabled:opacity-60"
            />
            <button
              type="button"
              onClick={play}
              disabled={!model}
              className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md bg-ember px-4 text-small font-semibold text-ground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              <span aria-hidden="true">▶</span> Play
            </button>
          </div>
        </div>
      </div>

      {/* The network itself. */}
      <div
        className={`relative ${bench ? "overflow-x-auto overflow-y-hidden" : "overflow-hidden"}`}
        style={bench ? { scrollbarWidth: "thin", scrollbarColor: "var(--field) transparent" } : undefined}
      >
        <div
          className={
            bench
              ? "relative h-[90vh] min-h-[32rem] w-full lg:h-[86vh] lg:min-h-[38rem] lg:w-[170vw] xl:w-[150vw]"
              : "relative h-[70vh] min-h-[22rem] w-full lg:h-[31rem]"
          }
        >
          {field}
          {model && webgl === false && <StillField />}
        </div>

        {/* Overlays that scroll with the bench canvas. */}
        {bench && log.length > 0 && (
          <ol
            aria-label="What is happening"
            className="pointer-events-none absolute right-4 top-4 hidden w-[24rem] max-w-[45%] flex-col gap-1 rounded-md border border-field bg-ground/92 p-3 font-mono text-micro text-ink-soft shadow-float sm:flex lg:right-6"
          >
            {log.map((line, i) => (
              <li
                key={`${i}-${line}`}
                className={i === log.length - 1 ? "text-ink" : ""}
                style={{ opacity: 0.45 + (0.55 * (i + 1)) / log.length }}
              >
                {line}
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Overlays pinned to the frame. */}
      {caption && (
        <div
          aria-live="polite"
          className="pointer-events-none absolute left-3 top-[7.5rem] max-w-[70%] rounded-md border border-field bg-ground/95 px-3 py-2 font-mono text-micro text-ink shadow-float sm:left-4 sm:top-[7rem]"
        >
          {caption}
        </div>
      )}
      <div className="pointer-events-none absolute bottom-16 left-3 w-[min(20rem,calc(100%-1.5rem))] sm:left-4">
        <Inspector info={inspected} />
      </div>
      {!narrow && (
        <AgentPop
          conclusion={conclusion}
          onReplay={play}
          onClose={() => setConclusion(null)}
          compact={!bench}
        />
      )}
      {narrow && (
        <AgentPop
          conclusion={conclusion}
          onReplay={play}
          onClose={() => setConclusion(null)}
          compact
          inline
        />
      )}

      {/* Bottom bar: the answer and the view controls. */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line bg-ground/60 px-3 py-2.5 sm:px-4">
        <output
          htmlFor="langid"
          aria-live="polite"
          className="flex items-baseline gap-2 text-small"
        >
          <span className="text-ink-faint">answer</span>
          <span className={`font-semibold ${prediction ? "text-[#fde68a]" : "text-ink-faint"}`}>
            {verdict ?? "…"}
          </span>
          {prediction && (
            <span className="font-mono text-micro text-ink-soft">{Math.round(prediction.top.p * 100)}%</span>
          )}
        </output>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-pressed={muted}
            aria-label={muted ? "Turn sound on" : "Turn sound off"}
            title={muted ? "Sound off" : "Sound on"}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-field text-small text-ink-soft hover:text-ink"
          >
            <span aria-hidden="true">{muted ? "🔇" : "🔔"}</span>
          </button>
          <div className="flex items-center gap-1.5" role="group" aria-label="Zoom">
            <button
              type="button"
              onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
              disabled={zoomIndex === 0}
              aria-label="Zoom out"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-field text-ink disabled:opacity-40"
            >
              −
            </button>
            <span className="min-w-[2.6rem] text-center font-mono text-micro text-ink-soft">{zoom.toFixed(1)}×</span>
            <button
              type="button"
              onClick={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
              disabled={zoomIndex === ZOOM_STEPS.length - 1}
              aria-label="Zoom in"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-field text-ink disabled:opacity-40"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={toggleMode}
            className="ml-1 inline-flex h-9 items-center gap-2 rounded-md border border-field px-3 text-small text-ink-soft hover:border-ember hover:text-ink"
          >
            <span aria-hidden="true">{bench ? "⤡" : "⤢"}</span>
            <span className="sm:hidden">{bench ? "Close" : "Full bench"}</span>
            <span className="hidden sm:inline">{bench ? "Close the bench" : "Open the full bench"}</span>
          </button>
        </div>
      </div>

      {/* Legend, bench mode only. */}
      {bench && (
        <div className="border-t border-line px-3 py-3 sm:px-4">
          <dl className="flex flex-wrap gap-x-6 gap-y-2 text-small text-ink-soft">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="h-2 w-6 rounded-sm bg-[#7dd3fc]" />
              <dt className="sr-only">Blue line</dt>
              <dd>blue helps</dd>
            </div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="h-2 w-6 rounded-sm bg-[#f9a8d4]" />
              <dt className="sr-only">Pink line</dt>
              <dd>pink blocks</dd>
            </div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="h-2 w-6 rounded-sm bg-ink" />
              <dt className="sr-only">Bright line</dt>
              <dd>bright carries your sentence</dd>
            </div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#fde68a]" />
              <dt className="sr-only">Yellow dot</dt>
              <dd>yellow wins</dd>
            </div>
            <p className="font-mono text-micro text-ink-faint">
              drag to move · point at a neuron for details{!narrow && " · scroll sideways for the rest"}
            </p>
          </dl>
        </div>
      )}
    </section>
  );
}

export interface Conclusion {
  language: string;
  percent: number;
  confidence: string;
  detail: string;
}

/** The character's conclusion, from real numbers in the run. */
function summarise(
  model: LangIdModel | null,
  prediction: Prediction | null,
  winner: number,
  probability: number,
): Conclusion | null {
  if (!model || !prediction) return null;
  const name = model.labels[winner]?.name ?? "that language";
  const pct = Math.round(probability * 100);
  const runnerUp = prediction.second;
  const hidden = prediction.activations.slice(1, -1);
  let strong = 0;
  let total = 0;
  for (const layer of hidden) for (const v of layer) {
    total++;
    if (Math.abs(v) > 0.3) strong++;
  }
  const patterns = prediction.activations[0].filter((v) => v > 0).length;
  const confidence = pct >= 85 ? "I'm sure" : pct >= 55 ? "I think" : "I'm guessing";
  const second =
    runnerUp.p >= 0.05
      ? `${runnerUp.name} came second at ${Math.round(runnerUp.p * 100)}%`
      : "nothing else came close";
  return {
    language: name,
    percent: pct,
    confidence,
    detail: `I read ${patterns} letter patterns, ${strong} of my ${total} neurons fired, and ${second}.`,
  };
}

function Inspector({ info }: { info: NeuronInfo | null }) {
  if (!info) return null;
  const id = `${info.layer}_${String(info.index).padStart(2, "0")}`;
  const pct = info.activation === null ? null : Math.round(Math.abs(info.activation) * 100);
  return (
    <div className="pointer-events-auto rounded-md border border-field bg-ground/95 p-3 text-small text-ink-soft shadow-float animate-pop">
      <p className="font-semibold text-ink">
        {info.name ? `${info.name}` : `Neuron ${id}`}
        {info.name && <span className="ml-2 font-mono text-micro font-normal text-ink-soft">{id}</span>}
      </p>
      <p className="mt-1">
        {pct === null
          ? "Waiting for a sentence."
          : info.layer === "out"
            ? `${pct}% sure it is this language.`
            : `${pct}% active for this sentence.`}
      </p>
      {info.inputs.length > 0 && (
        <>
          <p className="mt-2 font-mono text-micro text-ink-faint">listens most to</p>
          <ul className="mt-1 space-y-0.5 font-mono text-micro">
            {info.inputs.map(([source, w]) => (
              <li key={source} className="flex items-center justify-between gap-3">
                <span>{source}</span>
                <span className={w >= 0 ? "text-[#7dd3fc]" : "text-[#f9a8d4]"}>
                  {w >= 0 ? "helps " : "blocks "}
                  {Math.abs(w).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function examplesToShow(model: LangIdModel) {
  const seen = new Set<string>();
  return [...model.examples]
    .sort((a, b) => a.text.length - b.text.length)
    .filter((example) => {
      if (seen.has(example.code)) return false;
      seen.add(example.code);
      return true;
    })
    .slice(0, 4);
}

function StillField() {
  return (
    <div
      aria-hidden="true"
      className="h-full w-full"
      style={{
        backgroundImage:
          "repeating-linear-gradient(100deg, rgba(125,211,252,0.18) 0 1px, transparent 1px 7px), repeating-linear-gradient(80deg, rgba(249,168,212,0.12) 0 1px, transparent 1px 11px)",
        maskImage: "radial-gradient(ellipse 60% 70% at 50% 50%, black 20%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 60% 70% at 50% 50%, black 20%, transparent 100%)",
      }}
    />
  );
}
