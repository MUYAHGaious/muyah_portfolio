"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from "framer-motion";
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

/**
 * macOS-style magnifying dock.
 *
 * Each item's width is a spring driven by its distance from the pointer, so the
 * row swells under the cursor. That physics is the whole point of the component
 * and is genuinely impractical in CSS — which is why framer-motion earns its
 * place here, having been declined for the plain hover effects elsewhere.
 *
 * Accessibility notes on top of the original:
 *  - Items are real links inside a <nav>, not divs with role="button", so
 *    keyboard and screen-reader users get normal navigation.
 *  - The magnification is pointer-driven only. Keyboard focus still reveals the
 *    label, so tabbing through never leaves an unlabelled row of icons.
 */

const DEFAULT_MAGNIFICATION = 68;
const DEFAULT_DISTANCE = 140;
const DEFAULT_PANEL_HEIGHT = 48;
const BASE_ITEM_WIDTH = 40;

type DockContextType = {
  mouseX: MotionValue;
  spring: SpringOptions;
  magnification: number;
  distance: number;
};

const DockContext = createContext<DockContextType | undefined>(undefined);

function useDock() {
  const context = useContext(DockContext);
  if (!context) throw new Error("Dock components must be used inside <Dock>");
  return context;
}

export function Dock({
  children,
  className,
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  panelHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
}) {
  const mouseX = useMotionValue(Infinity);

  // The original springs the container's height on hover. Inside a sticky
  // header that height is in normal flow, so every pointer movement resized the
  // bar and shoved the page down — the whole document appeared to shake. The
  // container is now a fixed height and the magnification happens entirely
  // inside it.
  return (
    <div
      style={{ height: panelHeight, scrollbarWidth: "none" }}
      className="flex max-w-full items-center overflow-visible"
    >
      <motion.div
        onMouseMove={({ pageX }) => mouseX.set(pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={cn("mx-auto flex w-fit items-center gap-1", className)}
        style={{ height: panelHeight }}
      >
        <DockContext.Provider value={{ mouseX, spring, distance, magnification }}>
          {children}
        </DockContext.Provider>
      </motion.div>
    </div>
  );
}

export function DockItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { distance, magnification, mouseX, spring } = useDock();
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (value) => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return value - rect.x - rect.width / 2;
  });

  const widthTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [BASE_ITEM_WIDTH, magnification, BASE_ITEM_WIDTH],
  );
  const width = useSpring(widthTransform, spring);

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      className={cn("relative inline-flex items-end justify-center", className)}
    >
      {Children.map(children, (child) =>
        cloneElement(child as React.ReactElement, { width, isHovered } as never),
      )}
    </motion.div>
  );
}

export function DockLabel({
  children,
  className,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const isHovered = (rest as Record<string, unknown>).isHovered as MotionValue<number>;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    return isHovered.on("change", (latest) => setVisible(latest === 1));
  }, [isHovered]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -8 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.18 }}
          className={cn(
            "pointer-events-none absolute -top-8 left-1/2 w-fit whitespace-pre rounded-full bg-ink px-2.5 py-1 text-micro font-semibold normal-case tracking-normal text-surface",
            className,
          )}
          role="tooltip"
          style={{ x: "-50%" }}
        >
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function DockIcon({
  children,
  className,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const width = (rest as Record<string, unknown>).width as MotionValue<number>;
  const fallback = useMotionValue(BASE_ITEM_WIDTH);

  // Fills the item rather than half of it. Halving looked right but left the
  // link inside only 20px wide, under the 24px minimum target size — the dock
  // still magnifies, the hit area just matches what you see.
  const iconWidth = useTransform(width ?? fallback, (value) => Math.max(value, BASE_ITEM_WIDTH));

  return (
    <motion.span
      style={{ width: iconWidth }}
      className={cn("flex items-center justify-center", className)}
    >
      {children}
    </motion.span>
  );
}
