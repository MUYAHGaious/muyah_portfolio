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
 * The hero's interactive half: the headline (passed in), a short explanation
 * of what the network is, three numbered steps a child can follow, the
 * network itself (very large, scrolls sideways on a desktop, vertical on a
 * phone), and a legend.
 *
 * Nothing runs on its own. The visitor picks a sentence or types one, presses
 * Play, and one calm wave of light crosses the network.
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

export function NetworkHero({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { model, error } = useLangModel();
  const reducedMotion = usePrefersReducedMotion();
  const narrow = useNarrow();
  const [webgl, setWebgl] = useState<boolean | null>(null);
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

  // Remember the mute choice per visitor.
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
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

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

  // Start with one example already answered, so the network is never blank,
  // but do not keep cycling: the visitor drives it from here.
  useEffect(() => {
    if (!model || text) return;
    const first = model.examples[0];
    if (first) {
      setText(first.text);
      run(first.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  // Typing only edits the sentence. Enter or Play sends it.
  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    setText(event.target.value);
  }

  function send(value: string) {
    soundsRef.current?.unlock();
    setConclusion(null);
    run(value);
    setReplayKey((k) => k + 1);
    fieldRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
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
  const onProgress = useCallback((text: string | null) => setCaption(text), []);
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

  return (
    <div className={`relative ${className}`}>
      <div className="shell relative pt-10 sm:pt-14">{children}</div>

      {/* What this is. */}
      <div className="shell relative mt-12">
        <div className="border-t border-line pt-8">
          <p className="readout">live model · langid-v1</p>
          <h2 className="mt-4 max-w-[24ch] text-h2 font-bold tracking-tight text-ink">
            Watch a real neural network think.
          </h2>
          <p className="mt-3 max-w-[44ch] text-lead text-ink-soft">
            I trained it to tell eight Malegado languages apart.
          </p>
        </div>
      </div>

      {/* Three steps. */}
      <div className="shell relative mt-10">
        <ol className="grid gap-6 border-y border-line py-6 lg:grid-cols-3 lg:gap-8">
          <li className="py-2 lg:border-l lg:border-line lg:pl-8 lg:first:border-0 lg:first:pl-0">
            <p className="font-mono text-micro text-ink-soft">step 1</p>
            <p className="mt-1 text-h4 font-semibold text-ink">Pick a sentence</p>
            {model && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {examplesToShow(model).map((example) => (
                  <button
                    key={example.text}
                    type="button"
                    onClick={() => tryExample(example.text)}
                    aria-pressed={text === example.text}
                    className={`rounded-full border px-3 py-1.5 text-small transition-colors ${
                      text === example.text
                        ? "border-ember bg-ember-tint text-ink"
                        : "border-field text-ink-soft hover:border-ember hover:text-ink"
                    }`}
                  >
                    {example.text}
                  </button>
                ))}
              </div>
            )}
            <input
              id="langid"
              ref={inputRef}
              value={text}
              onChange={onChange}
              onKeyDown={onKeyDown}
              placeholder={model ? "or type here, then press Enter" : error ? "the model could not load" : "loading the model"}
              aria-label={model ? "Your sentence (langid-v1)" : "Your sentence"}
              autoComplete="off"
              spellCheck={false}
              disabled={!model}
              className="mt-3 min-h-12 w-full rounded-[var(--r-md)] border border-field bg-ground/60 px-4 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ember disabled:opacity-60"
            />
          </li>

          <li className="py-2 lg:border-l lg:border-line lg:pl-8 lg:first:border-0 lg:first:pl-0">
            <p className="font-mono text-micro text-ink-soft">step 2</p>
            <p className="mt-1 text-h4 font-semibold text-ink">Press Play</p>
            <button
              type="button"
              onClick={play}
              disabled={!model}
              className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-ember px-6 text-small font-semibold text-ground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              <span aria-hidden="true">▶</span> Play
            </button>
          </li>

          <li className="py-2 lg:border-l lg:border-line lg:pl-8 lg:first:border-0 lg:first:pl-0">
            <p className="font-mono text-micro text-ink-soft">step 3</p>
            <p className="mt-1 text-h4 font-semibold text-ink">Get the answer</p>
            <output
              htmlFor="langid"
              aria-live="polite"
              className={`mt-3 flex min-h-12 items-center justify-center rounded-[var(--r-md)] border px-4 text-lead font-semibold transition-colors ${
                prediction ? "border-amber/50 bg-amber/10 text-amber" : "border-line text-ink-faint"
              }`}
            >
              {verdict ?? "…"}
            </output>
            {prediction && (
              <p className="mt-2 text-small text-ink-soft">{Math.round(prediction.top.p * 100)}% sure</p>
            )}
          </li>
        </ol>
      </div>

      {/* View controls. */}
      <div className="shell relative mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-micro text-ink-soft">
          drag to move · point at a neuron for details{!narrow && " · scroll sideways for the rest"}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-pressed={muted}
            className="mr-2 inline-flex min-h-11 items-center gap-2 rounded-full border border-field px-4 text-small text-ink-soft hover:text-ink"
          >
            <span aria-hidden="true">{muted ? "🔇" : "🔔"}</span>
            {muted ? "Sound off" : "Sound on"}
          </button>
        <div className="flex items-center gap-2" role="group" aria-label="Zoom">
          <button
            type="button"
            onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
            disabled={zoomIndex === 0}
            aria-label="Zoom out"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-field text-h4 text-ink disabled:opacity-40"
          >
            −
          </button>
          <span className="min-w-[3.5rem] text-center font-mono text-small text-ink-soft">{zoom.toFixed(1)}×</span>
          <button
            type="button"
            onClick={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
            disabled={zoomIndex === ZOOM_STEPS.length - 1}
            aria-label="Zoom in"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-field text-h4 text-ink disabled:opacity-40"
          >
            +
          </button>
          {zoomIndex > 0 && (
            <button
              type="button"
              onClick={() => setZoomIndex(0)}
              className="ml-1 rounded-full border border-field px-4 py-2.5 text-small text-ink-soft hover:text-ink"
            >
              Show all
            </button>
          )}
        </div>
        </div>
      </div>

      {/* The network. The wrapper holds the inspector so it stays put while
          the canvas inside scrolls sideways. */}
      <div ref={fieldRef} className="relative mt-4 scroll-mt-20">
      <div
        className="relative w-full overflow-x-auto overflow-y-hidden"
        style={{ scrollbarWidth: "thin", scrollbarColor: "var(--field) transparent" }}
      >
        <div className="relative h-[90vh] min-h-[32rem] w-full lg:h-[86vh] lg:min-h-[38rem] lg:w-[170vw] xl:w-[150vw]">
          {model && webgl && (
            <NeuralField
              model={model}
              activations={activations}
              zoom={zoom}
              replayKey={replayKey}
              reducedMotion={reducedMotion}
              orientation={narrow ? "vertical" : "horizontal"}
              onInspect={onInspect}
              onProgress={onProgress}
              onLog={onLog}
              onEvent={onEvent}
              className="h-full w-full"
            />
          )}
          {model && webgl === false && <StillField />}
        </div>
      </div>

        {caption && (
          <div
            aria-live="polite"
            className="pointer-events-none absolute left-4 top-4 rounded-[var(--r-md)] border border-field bg-ground/95 px-4 py-2.5 font-mono text-small text-ink shadow-float lg:left-6"
          >
            {caption}
          </div>
        )}
        {log.length > 0 && (
          <ol
            aria-label="What is happening"
            className="pointer-events-none absolute right-4 top-4 hidden w-[24rem] max-w-[45%] flex-col gap-1 rounded-[var(--r-md)] border border-field bg-ground/92 p-3 font-mono text-micro text-ink-soft shadow-float sm:flex lg:right-6"
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
        <div className="pointer-events-none absolute bottom-16 left-4 w-[min(22rem,calc(100%-2rem))] lg:left-6">
          <Inspector info={inspected} />
        </div>
        <AgentPop conclusion={conclusion} onReplay={play} onClose={() => setConclusion(null)} />
      </div>

      {/* Legend. */}
      <div className="shell relative pb-10 pt-6 sm:pb-14">
        <dl className="flex flex-wrap gap-x-8 gap-y-3 text-small text-ink-soft">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-2.5 w-7 rounded-sm bg-[#7dd3fc]" />
            <dt className="sr-only">Blue line</dt>
            <dd>blue helps</dd>
          </div>
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-2.5 w-7 rounded-sm bg-[#f9a8d4]" />
            <dt className="sr-only">Pink line</dt>
            <dd>pink blocks</dd>
          </div>
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-2.5 w-7 rounded-sm bg-ink" />
            <dt className="sr-only">Bright line</dt>
            <dd>bright carries your sentence</dd>
          </div>
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#fde68a]" />
            <dt className="sr-only">Yellow dot</dt>
            <dd>yellow wins</dd>
          </div>
        </dl>
        {accuracy !== null && (
          <p className="mt-5 font-mono text-micro text-ink-faint">
            {accuracy}% right on sentences it never saw · runs in your browser, nothing is sent anywhere
          </p>
        )}
      </div>
    </div>
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
    <div className="pointer-events-auto rounded-[var(--r-md)] border border-field bg-ground/95 p-4 text-small text-ink-soft shadow-float animate-pop">
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
          <p className="mt-3 font-mono text-micro text-ink-faint">listens most to</p>
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
    .slice(0, 5);
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
