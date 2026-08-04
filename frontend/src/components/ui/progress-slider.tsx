"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

/**
 * Auto-advancing slider with per-tab progress bars.
 *
 * Two changes from the supplied version:
 *
 *  - The original derives its slide order by reaching into `children`, matching
 *    on component type and reading `props.value`. That breaks the moment slides
 *    are wrapped or mapped. Slides register themselves through context instead.
 *  - The rAF loop read `progress` from the closure while also setting it, so the
 *    fast-forward maths drifted. Progress is derived from elapsed time only.
 *
 * Auto-advance stops entirely under prefers-reduced-motion — a panel that
 * rewrites itself every few seconds is exactly what that setting is asking to
 * be spared — and pauses on hover and on keyboard focus so it cannot yank
 * content away mid-read.
 */

interface ProgressSliderContextType {
  active: string;
  progress: number;
  select: (value: string) => void;
  register: (value: string) => void;
  vertical: boolean;
}

const ProgressSliderContext = createContext<ProgressSliderContextType | undefined>(undefined);

export const useProgressSliderContext = (): ProgressSliderContextType => {
  const context = useContext(ProgressSliderContext);
  if (!context) throw new Error("useProgressSliderContext must be used within a ProgressSlider");
  return context;
};

export const ProgressSlider: FC<{
  children: ReactNode;
  duration?: number;
  vertical?: boolean;
  activeSlider: string;
  className?: string;
}> = ({ children, duration = 6000, vertical = false, activeSlider, className }) => {
  const [active, setActive] = useState(activeSlider);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const values = useRef<string[]>([]);
  const frame = useRef(0);
  const startedAt = useRef(0);

  const register = useCallback((value: string) => {
    if (!values.current.includes(value)) values.current.push(value);
  }, []);

  const select = useCallback((value: string) => {
    setActive(value);
    setProgress(0);
    startedAt.current = performance.now();
  }, []);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    startedAt.current = performance.now();

    const tick = (now: number) => {
      const fraction = (now - startedAt.current) / duration;

      if (fraction >= 1) {
        const order = values.current;
        const next = order[(order.indexOf(active) + 1) % Math.max(order.length, 1)];
        setProgress(0);
        startedAt.current = now;
        if (next) setActive(next);
      } else {
        setProgress(fraction * 100);
      }

      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [active, duration, paused]);

  return (
    <ProgressSliderContext.Provider value={{ active, progress, select, register, vertical }}>
      <div
        className={cn("relative", className)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {children}
      </div>
    </ProgressSliderContext.Provider>
  );
};

export const SliderContent: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn("", className)}>{children}</div>;

export const SliderWrapper: FC<{ children: ReactNode; value: string; className?: string }> = ({
  children,
  value,
  className,
}) => {
  const { active, register } = useProgressSliderContext();

  useEffect(() => register(value), [register, value]);

  return (
    <AnimatePresence mode="popLayout">
      {active === value && (
        <motion.div
          key={value}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className={cn("", className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const SliderBtnGroup: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn("", className)}>{children}</div>;

export const SliderBtn: FC<{
  children: ReactNode;
  value: string;
  className?: string;
  progressBarClass?: string;
}> = ({ children, value, className, progressBarClass }) => {
  const { active, progress, select, vertical } = useProgressSliderContext();
  const isActive = active === value;

  return (
    <button
      type="button"
      onClick={() => select(value)}
      aria-current={isActive ? "true" : undefined}
      className={cn("relative overflow-hidden text-left transition-opacity duration-300", isActive ? "opacity-100" : "opacity-55 hover:opacity-80", className)}
    >
      {children}
      <div
        className="pointer-events-none absolute inset-0 -z-10 max-h-full max-w-full overflow-hidden"
        role="progressbar"
        aria-valuenow={isActive ? Math.round(progress) : 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Slide progress`}
      >
        <span
          className={cn("absolute left-0 top-0", progressBarClass)}
          style={{ [vertical ? "height" : "width"]: isActive ? `${progress}%` : "0%" }}
        />
      </div>
    </button>
  );
};
