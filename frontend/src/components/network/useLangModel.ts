"use client";

import { useEffect, useState } from "react";

import { loadModel, type LangIdModel } from "@/lib/langid";

/**
 * Loads the language model once per page. The JSON is ~160 KB and cached by
 * the browser, so the cost is a single request on first visit.
 */
export function useLangModel() {
  const [model, setModel] = useState<LangIdModel | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    loadModel()
      .then((loaded) => {
        if (!cancelled) setModel(loaded);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Model failed to load");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { model, error };
}

/** True when WebGL2 is available. Decides between the live field and the still. */
export function supportsWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
