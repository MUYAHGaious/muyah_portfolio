"use client";

import { useEffect, useRef, useState } from "react";

import type { Conclusion } from "@/components/network/NetworkBench";

/**
 * Muyah Code, the little character that pops out of the corner when a run
 * finishes and gives the conclusion in one breath.
 *
 * It is a CSS "3D" orb: layered radial gradients for the sphere, a specular
 * highlight, a soft shadow, and eyes that blink. No model files, no WebGL,
 * and it respects reduced motion (no slide, no blink).
 */
/** The pixel M from the Muyah Code logo, 7 by 7 cells. */
function PixelM() {
  const rows = ["11....1", "111..11", "1111.11", "1.11.11", "1.1.111", "1...111", "11..11."];
  return (
    <span
      aria-hidden="true"
      className="grid h-4 w-4 grid-cols-7 gap-[1px]"
      style={{ gridTemplateRows: "repeat(7, 1fr)" }}
    >
      {rows.flatMap((row, r) =>
        row.split("").map((cell, c) => (
          <span
            key={`${r}-${c}`}
            className="rounded-[1px]"
            style={{ background: cell === "1" ? (c < 3 ? "#6fd6c9" : "#b8f0e6") : "transparent" }}
          />
        )),
      )}
    </span>
  );
}

export function AgentPop({
  conclusion,
  onReplay,
  onClose,
  compact = false,
}: {
  conclusion: Conclusion | null;
  onReplay: () => void;
  onClose: () => void;
  /** Inside the docked frame: smaller orb, bottom-left, shorter bubble. */
  compact?: boolean;
}) {
  const [talking, setTalking] = useState(false);
  const orbRef = useRef<HTMLDivElement>(null);
  const [gaze, setGaze] = useState({ x: 0, y: 0 }); // -1..1

  // The eyes follow the pointer anywhere on the page.
  useEffect(() => {
    if (!conclusion) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (event: PointerEvent) => {
      const orb = orbRef.current;
      if (!orb) return;
      const r = orb.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const d = Math.hypot(dx, dy) || 1;
      // Full deflection beyond ~260px, eased in below that.
      const k = Math.min(1, d / 260);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setGaze({ x: (dx / d) * k, y: (dy / d) * k }));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [conclusion]);

  // "Talk" for a moment when a new conclusion arrives.
  useEffect(() => {
    if (!conclusion) return;
    setTalking(true);
    const timer = window.setTimeout(() => setTalking(false), 2600);
    return () => window.clearTimeout(timer);
  }, [conclusion]);

  if (!conclusion) return null;

  return (
    <div
      role="status"
      className={`agent-pop pointer-events-auto absolute left-3 flex items-end gap-3 sm:left-4 ${
        compact
          ? "agent-pop-compact bottom-16 max-w-[min(22rem,calc(100%-1.5rem))]"
          : "top-1/2 max-w-[min(26rem,calc(100%-2rem))] -translate-y-1/2 lg:left-6"
      }`}
    >
      <div className="relative order-1 shrink-0">
        <div
          ref={orbRef}
          className={`agent-orb ${talking ? "agent-orb-talking" : ""}`}
          aria-hidden="true"
          style={{
            // The whole ball turns a little toward the pointer; the eyes move more.
            transform: `rotateY(${gaze.x * 14}deg) rotateX(${-gaze.y * 10}deg)`,
          }}
        >
          <span className="agent-eye agent-eye-left" style={{ translate: `${gaze.x * 7}px ${gaze.y * 6}px` }} />
          <span className="agent-eye agent-eye-right" style={{ translate: `${gaze.x * 7}px ${gaze.y * 6}px` }} />
          <span className="agent-mouth" />
          <span className="agent-shine" />
        </div>
        <span aria-hidden="true" className="agent-shadow" />
      </div>

      <div className="order-2 min-w-[16rem] rounded-[var(--r-lg)] rounded-bl-sm border border-field bg-ground/95 p-4 text-small text-ink shadow-float">
        <p className="flex items-center gap-2 font-mono text-micro text-ink-soft">
          <PixelM />
          Muyah Code
        </p>
        <p className="mt-2 flex items-baseline gap-3">
          <span className={`font-bold tracking-tight text-[#fde68a] ${compact ? "text-h3" : "text-h2"}`}>
            {conclusion.language}
          </span>
          <span className="font-mono text-h4 text-ink">{conclusion.percent}%</span>
        </p>
        <p className="mt-0.5 text-small text-ink-soft">{conclusion.confidence}.</p>
        {!compact && <p className="mt-2 text-micro leading-relaxed text-ink-soft">{conclusion.detail}</p>}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onReplay}
            className="rounded-full bg-ember px-3.5 py-1.5 text-micro font-semibold text-ground"
          >
            Play again
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-field px-3.5 py-1.5 text-micro text-ink-soft hover:text-ink"
          >
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        .agent-pop {
          animation: agent-in 600ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        @keyframes agent-in {
          from {
            opacity: 0;
            transform: translate3d(-2rem, -50%, 0) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate3d(0, -50%, 0);
          }
        }
        .agent-pop {
          transform: translate3d(0, -50%, 0);
          perspective: 400px;
        }
        .agent-pop-compact {
          transform: none;
          animation-name: agent-in-compact;
        }
        @keyframes agent-in-compact {
          from {
            opacity: 0;
            transform: translate3d(-1.5rem, 0, 0) scale(0.85);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .agent-pop-compact .agent-orb {
          width: 60px;
          height: 60px;
        }
        .agent-pop-compact .agent-eye {
          width: 8px;
          height: 19px;
        }
        .agent-pop-compact .agent-eye-left {
          left: 21px;
          top: 24px;
        }
        .agent-pop-compact .agent-eye-right {
          left: 36px;
          top: 17px;
        }
        .agent-pop-compact .agent-shine {
          left: 11px;
          top: 7px;
          width: 16px;
          height: 9px;
        }
        .agent-orb {
          position: relative;
          width: 84px;
          height: 84px;
          border-radius: 50%;
          /* A matte white ball lit from the top left, shaded to grey at the
             bottom right, with one soft highlight. */
          background:
            radial-gradient(circle at 30% 26%, #ffffff 0, #f4f5f7 22%, rgba(244, 245, 247, 0) 48%),
            radial-gradient(circle at 72% 80%, #8d93a1 0, rgba(141, 147, 161, 0) 58%),
            radial-gradient(circle at 50% 50%, #eef0f3 0%, #d9dce3 55%, #a7adb9 100%);
          box-shadow:
            inset -10px -12px 22px rgba(20, 24, 40, 0.28),
            inset 6px 8px 14px rgba(255, 255, 255, 0.5),
            0 14px 28px rgba(0, 0, 0, 0.5);
          transition: transform 120ms ease-out;
          transform-style: preserve-3d;
        }
        .agent-shine {
          position: absolute;
          left: 16px;
          top: 10px;
          width: 22px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          filter: blur(2px);
          transform: rotate(-28deg);
        }
        /* Two slanted capsule eyes, the right one a little higher. */
        .agent-eye {
          position: absolute;
          width: 11px;
          height: 26px;
          border-radius: 8px;
          background: #0b0f1a;
          transform: rotate(-22deg);
          transform-origin: 50% 50%;
          animation: agent-blink 4.6s infinite;
        }
        .agent-eye-left {
          left: 30px;
          top: 34px;
        }
        .agent-eye-right {
          left: 50px;
          top: 24px;
          animation-delay: 0.05s;
        }
        @keyframes agent-blink {
          0%,
          92%,
          100% {
            transform: rotate(-22deg) scaleY(1);
          }
          95% {
            transform: rotate(-22deg) scaleY(0.12);
          }
        }
        /* No mouth: it "talks" by nodding. */
        .agent-mouth {
          display: none;
        }
        .agent-orb-talking {
          animation: agent-nod 420ms ease-in-out infinite alternate;
        }
        @keyframes agent-nod {
          from {
            margin-top: 0;
          }
          to {
            margin-top: -5px;
          }
        }
        .agent-eye {
          transition: translate 120ms ease-out;
        }
        .agent-shadow {
          position: absolute;
          left: 10px;
          right: 10px;
          bottom: -8px;
          height: 10px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.45);
          filter: blur(4px);
        }
        @media (prefers-reduced-motion: reduce) {
          .agent-pop,
          .agent-orb,
          .agent-eye,
          .agent-orb-talking {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
