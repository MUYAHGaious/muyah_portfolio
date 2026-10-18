"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { OrbStage } from "@/components/demo/VoiceOrb";

const VoiceOrb = dynamic(() => import("@/components/demo/VoiceOrb").then((m) => m.VoiceOrb), {
  ssr: false,
});

/**
 * A scripted replay of a talk-back exchange: the learner speaks, the app
 * transcribes, thinks, and answers out loud. A 3D voice orb shows which part
 * of the loop is active and the conversation builds up underneath.
 *
 * Mobile first: the orb and stage on top, the exchange below, one column.
 * Nothing here calls a model, and it says so on screen.
 */

interface Stage {
  name: Exclude<OrbStage, "idle">;
  ms: number;
}

interface Turn {
  who: "learner" | "app";
  text: string;
  gloss: string;
  stages: Stage[];
}

interface Script {
  title: string;
  note: string;
  language: string;
  turns: Turn[];
}

const STAGE_LABEL: Record<OrbStage, string> = {
  idle: "ready",
  listening: "listening",
  transcribing: "speech to text",
  thinking: "thinking",
  speaking: "speaking",
};

const PAUSE_BETWEEN_TURNS_MS = 700;
const PAUSE_BEFORE_LOOP_MS = 2600;

export function TalkbackReplay({ src = "/demos/talkback-hausa.json" }: { src?: string }) {
  const [script, setScript] = useState<Script | null>(null);
  const [shown, setShown] = useState<number>(0);
  const [stage, setStage] = useState<OrbStage>("idle");
  const reduced = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch(src)
      .then((r) => r.json())
      .then((data: Script) => {
        if (!cancelled) setScript(data);
      })
      .catch(() => {
        /* the card still renders its copy without the replay */
      });
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    if (!script) return;
    if (reduced.current) {
      setShown(script.turns.length);
      setStage("idle");
      return;
    }
    let timer = 0;
    let alive = true;
    const schedule = (fn: () => void, ms: number) => {
      timer = window.setTimeout(() => alive && fn(), ms);
    };
    const runTurn = (index: number) => {
      if (index >= script.turns.length) {
        setStage("idle");
        schedule(() => {
          setShown(0);
          runTurn(0);
        }, PAUSE_BEFORE_LOOP_MS);
        return;
      }
      const turn = script.turns[index];
      let total = 0;
      turn.stages.forEach((s) => {
        schedule(() => setStage(s.name), total);
        total += s.ms;
      });
      const revealAt =
        turn.who === "learner"
          ? turn.stages.slice(0, 2).reduce((a, s) => a + s.ms, 0)
          : turn.stages.slice(0, 1).reduce((a, s) => a + s.ms, 0);
      schedule(() => setShown(index + 1), revealAt);
      schedule(() => {
        setStage("idle");
        runTurn(index + 1);
      }, total + PAUSE_BETWEEN_TURNS_MS);
    };
    setShown(0);
    runTurn(0);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [script]);

  const visibleTurns = script ? script.turns.slice(0, shown) : [];

  return (
    <div className="flex h-full flex-col rounded-[var(--r-lg)] border border-line bg-ground/70 p-4 sm:p-5">
      {/* Orb and stage. */}
      <div className="relative mx-auto h-44 w-44 sm:h-52 sm:w-52">
        <VoiceOrb stage={stage} className="h-full w-full" />
        <p
          aria-live="polite"
          className="absolute inset-x-0 -bottom-1 text-center font-mono text-micro text-ink-soft"
        >
          {STAGE_LABEL[stage]}
        </p>
      </div>

      {/* The exchange. */}
      <div className="mt-5 flex min-h-[9rem] flex-1 flex-col justify-end gap-2" aria-live="polite">
        {visibleTurns.map((turn, i) => (
          <div
            key={i}
            className={`max-w-[90%] rounded-[var(--r-md)] px-3 py-2 text-small animate-pop ${
              turn.who === "learner"
                ? "self-start border border-line bg-surface text-ink"
                : "self-end bg-ember-tint text-ink"
            }`}
          >
            <p className="leading-snug">{turn.text}</p>
            <p className="mt-0.5 text-micro text-ink-soft">{turn.gloss}</p>
          </div>
        ))}
      </div>

      <p className="mt-3 font-mono text-micro text-ink-faint">
        {script ? `${script.language} · replay of a real exchange, not live` : "replay"}
      </p>
    </div>
  );
}
