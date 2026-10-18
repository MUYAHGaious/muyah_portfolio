"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";

import type { LangIdModel } from "@/lib/langid";

/**
 * The network, drawn plainly, and run one neuron at a time.
 *
 * Every neuron of the language model is a point; the strongest incoming
 * weights of each neuron are clean lines, sky blue for positive and soft pink
 * for negative. When a sentence is sent, the network fires in order: the
 * active inputs light one after another, then each neuron of layer 1 in turn
 * lights together with the lines feeding it, then layer 2, then each language
 * in turn, and the winner turns yellow. The camera zooms in and follows the
 * neuron that is firing, then pulls back to show the whole picture.
 *
 * No glow, no flashing, nothing moving on its own. Repaints only while the run
 * is playing, the view is moving, or the pointer is over a neuron.
 */

export interface FieldActivations {
  layers: Float32Array[];
  key: number;
}

export interface NeuronInfo {
  layer: string;
  index: number;
  activation: number | null;
  inputs: [string, number][];
  name?: string;
}

interface Props {
  model: LangIdModel;
  activations: FieldActivations | null;
  zoom?: number;
  replayKey?: number;
  reducedMotion?: boolean;
  orientation?: "horizontal" | "vertical";
  onInspect?: (info: NeuronInfo | null) => void;
  onProgress?: (caption: string | null) => void;
  /** One short line per neuron as it fires; null means a new run started. */
  onLog?: (line: string | null) => void;
  /** Fires as things happen, for sound and for the closing summary. */
  onEvent?: (event: FieldEvent) => void;
  className?: string;
}

export type FieldEvent =
  | { kind: "input" }
  | { kind: "hidden"; layer: number; value: number }
  | { kind: "output"; index: number; value: number }
  | { kind: "done"; winner: number; probability: number };

const POSITIVE = new THREE.Color("#7dd3fc");
const NEGATIVE = new THREE.Color("#f9a8d4");
const NEURON = new THREE.Color("#e6ecff");
const WINNER = new THREE.Color("#fde68a");
const BACKGROUND = new THREE.Color("#0b1230");

const KEEP_PER_NEURON = [10, 14, 42];

/* Timing of the run, in milliseconds per event. */
const INPUT_EVERY = 45; // each active input bucket
const HIDDEN_EVERY = [60, 85]; // each neuron of layer 1, layer 2
const OUTPUT_EVERY = 260; // each language
const GAP_BETWEEN_LAYERS = 500;
const FLASH_MS = 420; // how long a neuron and its lines flare when they fire
const SETTLE_MS = 1400; // pull back to the full view after the last event
const FOLLOW_ZOOM = 2.1;

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

function columnHeight(n: number) {
  if (n >= 128) return 2.7;
  if (n >= 48) return 2.45;
  if (n >= 24) return 2.2;
  return 1.5;
}

function makeDotTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.78, "rgba(255,255,255,1)");
  g.addColorStop(0.92, "rgba(255,255,255,0.6)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

interface Event {
  at: number; // ms from start
  layer: number;
  index: number;
}

export function NeuralField({
  model,
  activations,
  zoom = 1,
  replayKey = 0,
  reducedMotion = false,
  orientation = "horizontal",
  onInspect,
  onProgress,
  onLog,
  onEvent,
  className = "",
}: Props) {
  const vertical = orientation === "vertical";
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLCanvasElement>(null);
  const activationsRef = useRef<FieldActivations | null>(activations);
  const runStartRef = useRef<number>(-1);
  const lastKeyRef = useRef<number>(-1);
  const zoomRef = useRef(zoom);
  const inspectRef = useRef(onInspect);
  const progressRef = useRef(onProgress);
  const logRef = useRef(onLog);
  const eventRef = useRef(onEvent);
  const requestRenderRef = useRef<() => void>(() => {});
  const startRunRef = useRef<() => void>(() => {});

  useEffect(() => {
    activationsRef.current = activations;
    if (activations && activations.key !== lastKeyRef.current) {
      lastKeyRef.current = activations.key;
      startRunRef.current();
    }
    requestRenderRef.current();
  }, [activations]);

  useEffect(() => {
    if (replayKey > 0 && activationsRef.current) startRunRef.current();
  }, [replayKey]);

  useEffect(() => {
    zoomRef.current = zoom;
    requestRenderRef.current();
  }, [zoom]);

  useEffect(() => {
    inspectRef.current = onInspect;
    progressRef.current = onProgress;
    logRef.current = onLog;
    eventRef.current = onEvent;
  }, [onInspect, onProgress, onLog, onEvent]);

  useEffect(() => {
    const hostEl = hostRef.current;
    const labelEl = labelRef.current;
    if (!hostEl || !labelEl) return;
    const host: HTMLDivElement = hostEl;
    const labelCanvas: HTMLCanvasElement = labelEl;

    // -------------------------------------------------------------- layout
    const sizes = [model.features.buckets, ...model.layers.map((l) => l.out)];
    const layerCount = sizes.length;
    const rect0 = host.getBoundingClientRect();
    const aspect0 = Math.max(0.3, rect0.width / Math.max(1, rect0.height));
    const spacing = vertical
      ? Math.max(1.05, (3.0 / aspect0 - 1.9) / (layerCount - 1))
      : Math.max(1.25, (3.65 * aspect0 - 2.8) / (layerCount - 1));
    const xs = sizes.map((_, i) => (i - (layerCount - 1) / 2) * spacing);
    const titles = ["input", "layer 1", "layer 2", "output"];
    const shortTitles = ["in", "h1", "h2", "out"];
    const layerName = (li: number) =>
      li === 0 ? titles[0] : li === layerCount - 1 ? titles[3] : titles[li];
    const shortName = (li: number) =>
      li === 0 ? shortTitles[0] : li === layerCount - 1 ? shortTitles[3] : shortTitles[li];

    const positions: Float32Array[] = sizes.map((n, li) => {
      const h = columnHeight(n);
      const arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0.5 : i / (n - 1);
        const along = xs[li];
        const across = (0.5 - t) * h;
        arr[i * 3] = vertical ? across : along;
        arr[i * 3 + 1] = vertical ? -along : across;
        arr[i * 3 + 2] = 0;
      }
      return arr;
    });

    // -------------------------------------------------------------- fibres
    const kept: { li: number; i: number; o: number; w: number }[] = [];
    model.layers.forEach((layer, li) => {
      const k = Math.min(KEEP_PER_NEURON[li] ?? layer.in, layer.in);
      for (let o = 0; o < layer.out; o++) {
        const row = layer.W[o];
        const order = Array.from({ length: layer.in }, (_, i) => i).sort(
          (a, b) => Math.abs(row[b]) - Math.abs(row[a]),
        );
        for (let n = 0; n < k; n++) kept.push({ li, i: order[n], o, w: row[order[n]] });
      }
    });
    const fibreCount = kept.length;
    const maxAbsPerLayer = model.layers.map((layer) => {
      let m = 0;
      for (const row of layer.W) for (const w of row) m = Math.max(m, Math.abs(w));
      return m || 1;
    });

    const fibrePos = new Float32Array(fibreCount * 6);
    const fibreCol = new Float32Array(fibreCount * 6);
    const fibreBase = new Float32Array(fibreCount);
    const fibreSign = new Uint8Array(fibreCount);
    const fibreFrom = new Uint16Array(fibreCount);
    const fibreTo = new Uint16Array(fibreCount);
    const fibreLayer = new Uint8Array(fibreCount);

    kept.forEach((edge, f) => {
      const from = positions[edge.li];
      const to = positions[edge.li + 1];
      const p = f * 6;
      fibrePos[p] = from[edge.i * 3];
      fibrePos[p + 1] = from[edge.i * 3 + 1];
      fibrePos[p + 2] = 0;
      fibrePos[p + 3] = to[edge.o * 3];
      fibrePos[p + 4] = to[edge.o * 3 + 1];
      fibrePos[p + 5] = -0.01;
      fibreBase[f] = 0.5 + 0.5 * Math.sqrt(Math.abs(edge.w) / maxAbsPerLayer[edge.li]);
      fibreSign[f] = edge.w >= 0 ? 1 : 0;
      fibreFrom[f] = edge.i;
      fibreTo[f] = edge.o;
      fibreLayer[f] = edge.li;
    });

    const fibreGeo = new LineSegmentsGeometry();
    fibreGeo.setPositions(fibrePos);
    fibreGeo.setColors(fibreCol);
    const fibreMat = new LineMaterial({
      vertexColors: true,
      linewidth: 1.5,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    const fibres = new LineSegments2(fibreGeo, fibreMat);

    // ------------------------------------------------------------- neurons
    const neuronTotal = sizes.reduce((a, b) => a + b, 0);
    const neuronPos = new Float32Array(neuronTotal * 3);
    const neuronCol = new Float32Array(neuronTotal * 3);
    const neuronSize = new Float32Array(neuronTotal);
    const neuronLayer = new Uint8Array(neuronTotal);
    const neuronIndex = new Uint16Array(neuronTotal);
    const layerOffset: number[] = [];
    let n = 0;
    positions.forEach((arr, li) => {
      layerOffset.push(n);
      const count = sizes[li];
      const size = li === 0 ? 0.03 : li === layerCount - 1 ? 0.16 : 0.085;
      for (let i = 0; i < count; i++) {
        neuronPos[n * 3] = arr[i * 3];
        neuronPos[n * 3 + 1] = arr[i * 3 + 1];
        neuronPos[n * 3 + 2] = 0.02;
        neuronSize[n] = size;
        neuronLayer[n] = li;
        neuronIndex[n] = i;
        n++;
      }
    });
    const neuronGeo = new THREE.BufferGeometry();
    neuronGeo.setAttribute("position", new THREE.BufferAttribute(neuronPos, 3));
    const neuronColAttr = new THREE.BufferAttribute(neuronCol, 3);
    neuronColAttr.setUsage(THREE.DynamicDrawUsage);
    neuronGeo.setAttribute("color", neuronColAttr);
    const neuronSizeAttr = new THREE.BufferAttribute(neuronSize, 1);
    neuronSizeAttr.setUsage(THREE.DynamicDrawUsage);
    neuronGeo.setAttribute("aSize", neuronSizeAttr);
    const baseSize = Float32Array.from(neuronSize);
    const neuronMat = new THREE.ShaderMaterial({
      uniforms: { uTex: { value: makeDotTexture() }, uScale: { value: 1 } },
      vertexShader: `
        uniform float uScale;
        attribute float aSize;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uScale / -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform sampler2D uTex;
        varying vec3 vColor;
        void main() {
          vec4 t = texture2D(uTex, gl_PointCoord);
          if (t.a < 0.05) discard;
          gl_FragColor = vec4(vColor, t.a);
        }`,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
    });
    const neurons = new THREE.Points(neuronGeo, neuronMat);

    // ---------------------------------------------------------------- scene
    const scene = new THREE.Scene();
    scene.background = BACKGROUND;
    scene.add(fibres, neurons);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0, 5.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    host.insertBefore(renderer.domElement, labelCanvas);
    Object.assign(renderer.domElement.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      touchAction: "pan-y",
      cursor: "grab",
    });

    const labelCtx = labelCanvas.getContext("2d")!;

    // ------------------------------------------------------------- the run
    // Built when a sentence is sent: the ordered list of neurons that fire.
    let events: Event[] = [];
    let firedAt = new Float32Array(neuronTotal).fill(-1); // ms from start, -1 = never
    let runEnd = 0;
    let inputScale = 0;

    function buildRun() {
      const act = activationsRef.current;
      events = [];
      firedAt = new Float32Array(neuronTotal).fill(-1);
      if (!act) return;
      const inp = act.layers[0];
      let max = 0;
      for (let i = 0; i < inp.length; i++) max = Math.max(max, inp[i]);
      inputScale = max > 0 ? 1 / max : 0;

      let t = 0;
      // Active input buckets, in position order.
      for (let i = 0; i < inp.length; i++) {
        if (inp[i] > 0) {
          events.push({ at: t, layer: 0, index: i });
          firedAt[layerOffset[0] + i] = t;
          t += INPUT_EVERY;
        }
      }
      t += GAP_BETWEEN_LAYERS;
      for (let li = 1; li < layerCount; li++) {
        const every = li === layerCount - 1 ? OUTPUT_EVERY : HIDDEN_EVERY[li - 1] ?? 70;
        for (let i = 0; i < sizes[li]; i++) {
          events.push({ at: t, layer: li, index: i });
          firedAt[layerOffset[li] + i] = t;
          t += every;
        }
        t += GAP_BETWEEN_LAYERS;
      }
      runEnd = t;
    }

    let following = false;
    let logged = 0; // events already written to the log
    startRunRef.current = () => {
      buildRun();
      runStartRef.current = performance.now();
      following = !reducedMotion;
      logged = 0;
      probsDone = false;
      logRef.current?.(null);
      needsRender = true;
    };

    /** A plain-words line for one firing event. */
    function describeEvent(e: Event): string {
      const act = activationsRef.current;
      if (!act) return "";
      const outLayer = layerCount - 1;
      if (e.layer === 0) {
        const v = act.layers[0][e.index];
        return `in_${String(e.index + 1).padStart(3, "0")} · pattern ${v.toFixed(2)}`;
      }
      const layer = model.layers[e.layer - 1];
      const row = layer.W[e.index];
      const prev = act.layers[e.layer - 1];
      let helping = 0;
      let blocking = 0;
      for (let j = 0; j < layer.in; j++) {
        const push = row[j] * prev[j];
        if (Math.abs(push) < 0.01) continue;
        if (push > 0) helping++;
        else blocking++;
      }
      const v = act.layers[e.layer][e.index];
      if (e.layer === outLayer) {
        return `${model.labels[e.index].name} · ${Math.round(v * 100)}%`;
      }
      const pct = Math.round(Math.abs(v) * 100);
      return `${shortName(e.layer)}_${String(e.index + 1).padStart(2, "0")} · ${pct}% · ${helping} help, ${blocking} block`;
    }

    // ---------------------------------------------------------------- view
    let width = 1;
    let height = 1;
    let fitDistance = 5.4;
    const pan = { x: 0, y: 0 };
    const view = { zoom: 1, x: 0, y: 0 }; // what the camera actually shows
    let needsRender = true;
    requestRenderRef.current = () => {
      needsRender = true;
    };

    function clampPan(z: number) {
      const limitX = (vertical ? 1.6 : (layerCount - 1) * spacing * 0.6) * (1 - 1 / z) + 0.3;
      const limitY = (vertical ? (layerCount - 1) * spacing * 0.6 : 1.6) * (1 - 1 / z) + 0.3;
      pan.x = THREE.MathUtils.clamp(pan.x, -limitX, limitX);
      pan.y = THREE.MathUtils.clamp(pan.y, -limitY, limitY);
    }

    function applyCamera() {
      camera.position.z = fitDistance / Math.max(1, view.zoom);
      camera.position.x = (vertical ? 0 : 0.25) + view.x;
      camera.position.y = (vertical ? -0.5 : 0) + view.y;
      camera.updateProjectionMatrix();
    }

    function resize() {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      fibreMat.resolution.set(width * dpr, height * dpr);
      camera.aspect = width / height;

      const fitHeight = vertical ? (layerCount - 1) * spacing + 2.4 : 3.65;
      const fitWidth = vertical ? 3.0 : (layerCount - 1) * spacing + 2.7;
      const vFov = THREE.MathUtils.degToRad(camera.fov);
      const distH = fitHeight / 2 / Math.tan(vFov / 2);
      const distW = fitWidth / 2 / Math.tan(vFov / 2) / camera.aspect;
      fitDistance = Math.max(distH, distW);
      applyCamera();
      neuronMat.uniforms.uScale.value = height * 1.15 * dpr;

      labelCanvas.width = Math.round(width * dpr);
      labelCanvas.height = Math.round(height * dpr);
      labelCanvas.style.width = `${width}px`;
      labelCanvas.style.height = `${height}px`;
      labelCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      needsRender = true;
    }
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    // ------------------------------------------------- pointer: pan + pick
    const projected = new THREE.Vector3();
    function toScreen(x: number, y: number) {
      projected.set(x, y, 0).project(camera);
      return { x: ((projected.x + 1) / 2) * width, y: ((1 - projected.y) / 2) * height };
    }

    let hovered = -1;
    let dragging = false;
    let moved = false;
    let last = { x: 0, y: 0 };

    function pick(px: number, py: number): number {
      let best = -1;
      let bestD = 16 * 16;
      for (let k = 0; k < neuronTotal; k++) {
        if (neuronLayer[k] === 0) continue;
        const s = toScreen(neuronPos[k * 3], neuronPos[k * 3 + 1]);
        const d = (s.x - px) ** 2 + (s.y - py) ** 2;
        if (d < bestD) {
          bestD = d;
          best = k;
        }
      }
      return best;
    }

    function describe(k: number): NeuronInfo {
      const li = neuronLayer[k];
      const i = neuronIndex[k];
      const act = activationsRef.current;
      const activation = act ? act.layers[li][i] : null;
      const inputs: [string, number][] = [];
      if (li > 0) {
        const layer = model.layers[li - 1];
        const row = layer.W[i];
        const order = Array.from({ length: layer.in }, (_, j) => j)
          .sort((a, b) => Math.abs(row[b]) - Math.abs(row[a]))
          .slice(0, 5);
        for (const j of order) {
          const src = `${shortName(li - 1)}_${String(j + 1).padStart(li - 1 === 0 ? 3 : 2, "0")}`;
          inputs.push([src, row[j]]);
        }
      }
      return {
        layer: shortName(li),
        index: i + 1,
        activation,
        inputs,
        name: li === layerCount - 1 ? model.labels[i]?.name : undefined,
      };
    }

    function onDown(event: PointerEvent) {
      dragging = true;
      moved = false;
      last = { x: event.clientX, y: event.clientY };
      renderer.domElement.style.cursor = "grabbing";
      renderer.domElement.setPointerCapture(event.pointerId);
    }
    function onMove(event: PointerEvent) {
      const rect = host.getBoundingClientRect();
      if (dragging) {
        const dx = event.clientX - last.x;
        const dy = event.clientY - last.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) {
          moved = true;
          following = false; // the visitor took the camera
        }
        last = { x: event.clientX, y: event.clientY };
        const vFov = THREE.MathUtils.degToRad(camera.fov);
        const worldPerPx = (2 * camera.position.z * Math.tan(vFov / 2)) / height;
        pan.x -= dx * worldPerPx;
        pan.y += dy * worldPerPx;
        clampPan(Math.max(1, zoomRef.current));
        needsRender = true;
        return;
      }
      const k = pick(event.clientX - rect.left, event.clientY - rect.top);
      if (k !== hovered) {
        hovered = k;
        renderer.domElement.style.cursor = k >= 0 ? "pointer" : "grab";
        inspectRef.current?.(k >= 0 ? describe(k) : null);
        needsRender = true;
      }
    }
    function onUp(event: PointerEvent) {
      if (!dragging) return;
      dragging = false;
      renderer.domElement.style.cursor = hovered >= 0 ? "pointer" : "grab";
      renderer.domElement.releasePointerCapture(event.pointerId);
      if (!moved) {
        const rect = host.getBoundingClientRect();
        const k = pick(event.clientX - rect.left, event.clientY - rect.top);
        hovered = k;
        inspectRef.current?.(k >= 0 ? describe(k) : null);
        needsRender = true;
      }
    }
    function onLeave() {
      if (hovered >= 0) {
        hovered = -1;
        inspectRef.current?.(null);
        needsRender = true;
      }
    }
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointercancel", onUp);
    renderer.domElement.addEventListener("pointerleave", onLeave);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) needsRender = true;
    });
    io.observe(host);

    // ------------------------------------------------------------ painting
    const tmpColor = new THREE.Color();
    let raf = 0;
    let lastCaption: string | null = null;
    let probsDone = false;

    function setCaption(caption: string | null) {
      if (caption !== lastCaption) {
        lastCaption = caption;
        progressRef.current?.(caption);
      }
    }

    function paint(now: number) {
      const act = activationsRef.current;
      const t = runStartRef.current < 0 ? Infinity : now - runStartRef.current;
      const running = Boolean(act) && t < runEnd + SETTLE_MS;
      const done = Boolean(act) && (reducedMotion || t >= runEnd);

      // Log every event that has fired since the last frame.
      if (act && !reducedMotion) {
        while (logged < events.length && events[logged].at <= t) {
          const e = events[logged];
          logRef.current?.(describeEvent(e));
          if (e.layer === 0) eventRef.current?.({ kind: "input" });
          else if (e.layer === layerCount - 1)
            eventRef.current?.({ kind: "output", index: e.index, value: act.layers[e.layer][e.index] });
          else eventRef.current?.({ kind: "hidden", layer: e.layer, value: Math.abs(act.layers[e.layer][e.index]) });
          logged++;
        }
        if (logged === events.length && t >= runEnd && runEnd > 0 && probsDone === false) {
          const probs = act.layers[layerCount - 1];
          let b = 0;
          for (let i = 1; i < probs.length; i++) if (probs[i] > probs[b]) b = i;
          logRef.current?.(`✓ ${model.labels[b].name} wins with ${Math.round(probs[b] * 100)}%`);
          eventRef.current?.({ kind: "done", winner: b, probability: probs[b] });
          probsDone = true;
        }
      }

      // How fired each neuron is: 0 before its moment, a flare at it, then 1.
      // `fire(k)` is 1 for settled, in (1,2] while flaring.
      const fire = (k: number) => {
        if (!act) return 0;
        if (reducedMotion) return 1;
        const at = firedAt[k];
        if (at < 0 || t < at) return 0;
        const age = t - at;
        return age < FLASH_MS ? 1 + (1 - age / FLASH_MS) : 1;
      };

      const hLayer = hovered >= 0 ? neuronLayer[hovered] : -1;
      const hIndex = hovered >= 0 ? neuronIndex[hovered] : -1;

      // Lines: a line into neuron o lights when o fires. Carrying lines settle
      // bright, quiet ones settle dim.
      for (let i = 0; i < fibreCount; i++) {
        const li = fibreLayer[i];
        const base = fibreBase[i];
        const c = fibreSign[i] ? POSITIVE : NEGATIVE;
        const target = layerOffset[li + 1] + fibreTo[i];
        const f = fire(target);

        let strength = 0;
        if (act) {
          const aIn = act.layers[li][fibreFrom[i]];
          strength = li === 0 ? Math.abs(aIn) * inputScale : Math.abs(aIn);
        }
        const carrying = strength > 0.22;
        const rest = 0.34 * base;
        const settled = carrying ? 0.65 + 0.35 * Math.min(1, strength) : 0.07;

        let intensity: number;
        if (!act || f === 0) intensity = rest;
        else if (f > 1) intensity = Math.max(settled, 0.55 + 0.45 * (f - 1)); // flare: every line into the firing neuron is seen
        else intensity = settled;

        if (hovered >= 0) {
          const touches =
            (li + 1 === hLayer && fibreTo[i] === hIndex) || (li === hLayer && fibreFrom[i] === hIndex);
          intensity = touches ? 1.0 : intensity * 0.2;
        }
        intensity = Math.max(0.07, Math.min(1.0, intensity));
        const p = i * 6;
        fibreCol[p] = fibreCol[p + 3] = c.r * intensity;
        fibreCol[p + 1] = fibreCol[p + 4] = c.g * intensity;
        fibreCol[p + 2] = fibreCol[p + 5] = c.b * intensity;
      }
      fibreGeo.setColors(fibreCol);

      const outLayer = layerCount - 1;
      const probs = act ? act.layers[outLayer] : null;
      let best = -1;
      if (probs) {
        best = 0;
        for (let i = 1; i < probs.length; i++) if (probs[i] > probs[best]) best = i;
      }

      // Neurons.
      for (let k = 0; k < neuronTotal; k++) {
        const li = neuronLayer[k];
        const i = neuronIndex[k];
        const isOut = li === outLayer;
        const f = fire(k);
        const value = act ? Math.abs(act.layers[li][i]) * (li === 0 ? inputScale : 1) : 0;
        const idle = li === 0 ? 0.3 : 0.45;
        let intensity = f > 0 ? Math.min(1, idle + value * 0.7) : idle;
        if (f > 1) intensity = 1;
        if (isOut && i === best && done) {
          tmpColor.copy(WINNER);
          intensity = 1;
        } else {
          tmpColor.copy(NEURON);
        }
        if (k === hovered) intensity = 1;
        neuronCol[k * 3] = tmpColor.r * intensity;
        neuronCol[k * 3 + 1] = tmpColor.g * intensity;
        neuronCol[k * 3 + 2] = tmpColor.b * intensity;
        // Firing neurons swell for a moment.
        neuronSize[k] = baseSize[k] * (f > 1 ? 1 + 0.45 * (f - 1) : 1) * (isOut && i === best && done ? 1.35 : 1);
      }
      neuronColAttr.needsUpdate = true;
      neuronSizeAttr.needsUpdate = true;

      // Camera: follow the firing neuron while running, then pull back.
      let targetZoom = Math.max(1, zoomRef.current);
      let targetX = pan.x;
      let targetY = pan.y;
      let caption: string | null = null;
      if (act && !reducedMotion && t < runEnd + SETTLE_MS) {
        // The event in progress (or the last one).
        let current: Event | null = null;
        for (const e of events) {
          if (e.at <= t) current = e;
          else break;
        }
        if (current && t < runEnd && following) {
          const k = layerOffset[current.layer] + current.index;
          targetZoom = FOLLOW_ZOOM;
          targetX = neuronPos[k * 3] - (vertical ? 0 : 0.25) + (vertical ? 0 : 0.35);
          targetY = neuronPos[k * 3 + 1] - (vertical ? -0.5 : 0);
        } else if (following) {
          // Finished: pull back to the whole picture.
          targetZoom = Math.max(1, zoomRef.current);
          targetX = 0;
          targetY = 0;
          pan.x = 0;
          pan.y = 0;
        }
        if (current) {
          const li = current.layer;
          const count = sizes[li];
          if (t >= runEnd) {
            caption = probs && best >= 0 ? `done · ${model.labels[best].name} wins with ${Math.round(probs[best] * 100)}%` : "done";
          } else if (li === 0) {
            const activeCount = events.filter((e) => e.layer === 0).length;
            const pos = events.filter((e) => e.layer === 0).findIndex((e) => e === current) + 1;
            caption = `input · reading letter pattern ${pos} of ${activeCount}`;
          } else if (li === outLayer) {
            caption = `output · ${model.labels[current.index].name} scores ${probs ? Math.round(probs[current.index] * 100) : 0}%`;
          } else {
            const v = act.layers[li][current.index];
            caption = `${layerName(li)} · neuron ${current.index + 1} of ${count} fires at ${Math.round(Math.abs(v) * 100)}%`;
          }
        }
      }
      setCaption(caption);

      const ease = reducedMotion ? 1 : 0.085;
      view.zoom += (targetZoom - view.zoom) * ease;
      view.x += (targetX - view.x) * ease;
      view.y += (targetY - view.y) * ease;
      applyCamera();

      renderer.render(scene, camera);
      paintLabels(act, best, done);

      return (
        running ||
        Math.abs(targetZoom - view.zoom) > 0.002 ||
        Math.abs(targetX - view.x) > 0.002 ||
        Math.abs(targetY - view.y) > 0.002
      );
    }

    function paintLabels(act: FieldActivations | null, best: number, done: boolean) {
      const ctx = labelCtx;
      ctx.clearRect(0, 0, width, height);
      const mono = getComputedStyle(host).getPropertyValue("--font-mono") || "monospace";
      const z = Math.max(1, view.zoom);

      const subtitles = ["your phrase, as 256 letter-pattern counts", "64 neurons", "42 neurons", "the 8 languages"];
      ctx.textBaseline = vertical ? "middle" : "alphabetic";
      const edge = columnHeight(sizes[0]) / 2 + 0.3;
      sizes.forEach((count, li) => {
        const sub = li === 0 ? subtitles[0] : li === layerCount - 1 ? subtitles[3] : subtitles[li];
        if (vertical) {
          const { y } = toScreen(0, -xs[li]);
          ctx.textAlign = "left";
          ctx.font = `600 11px ${mono}`;
          ctx.fillStyle = "rgba(230,236,255,0.95)";
          ctx.fillText(layerName(li), 12, y - 30);
          ctx.font = `400 10px ${mono}`;
          ctx.fillStyle = "rgba(154,165,204,0.9)";
          ctx.fillText(sub, 12, y - 17);
        } else {
          const { x } = toScreen(xs[li], 0);
          const yTop = Math.max(26, toScreen(0, edge).y);
          ctx.textAlign = "center";
          ctx.font = `600 12px ${mono}`;
          ctx.fillStyle = "rgba(230,236,255,0.95)";
          ctx.fillText(layerName(li), x, yTop - 14);
          ctx.font = `400 10px ${mono}`;
          ctx.fillStyle = "rgba(154,165,204,0.9)";
          ctx.fillText(sub, x, yTop);
        }
      });
      ctx.textBaseline = "middle";

      const t = runStartRef.current < 0 ? Infinity : performance.now() - runStartRef.current;
      const firedNow = (k: number) => act && (reducedMotion || (firedAt[k] >= 0 && t >= firedAt[k]));

      if (!vertical || z > 1.6) {
        ctx.font = `400 ${z > 1.6 ? 11 : 9}px ${mono}`;
        for (let li = 1; li < layerCount - 1; li++) {
          const count = sizes[li];
          const pos = positions[li];
          const a0 = toScreen(pos[0], pos[1]);
          const a1 = toScreen(pos[3], pos[4]);
          const pitch = Math.hypot(a1.x - a0.x, a1.y - a0.y);
          const step = pitch >= 10 ? 1 : pitch >= 5 ? 2 : 4;
          const values = act ? act.layers[li] : null;
          for (let i = 0; i < count; i += step) {
            const { x, y } = toScreen(pos[i * 3], pos[i * 3 + 1]);
            const k = layerOffset[li] + i;
            const lit = firedNow(k);
            const a = values && lit ? Math.abs(values[i]) : 0;
            ctx.fillStyle = `rgba(230,236,255,${0.4 + 0.6 * a})`;
            const label = `${shortName(li)}_${String(i + 1).padStart(2, "0")}${values && lit && z > 1.6 ? `  ${Math.round(a * 100)}%` : ""}`;
            if (vertical) {
              ctx.textAlign = "center";
              ctx.fillText(label, x, y - 12);
            } else {
              ctx.textAlign = "right";
              ctx.fillText(label, x - 10, y);
            }
          }
        }

        if (act) {
          const inp = act.layers[0];
          const pos = positions[0];
          const active: number[] = [];
          for (let i = 0; i < inp.length; i++) if (inp[i] > 0 && firedNow(layerOffset[0] + i)) active.push(i);
          active.sort((a, b) => inp[b] - inp[a]);
          ctx.font = `400 9px ${mono}`;
          let lastAlong = -Infinity;
          for (const i of active.slice(0, 60)) {
            const { x, y } = toScreen(pos[i * 3], pos[i * 3 + 1]);
            const along = vertical ? x : y;
            if (Math.abs(along - lastAlong) < (vertical ? 24 : 11)) continue;
            lastAlong = along;
            ctx.fillStyle = `rgba(125,211,252,${0.5 + 0.5 * inp[i] * inputScale})`;
            if (vertical) {
              ctx.textAlign = "center";
              ctx.fillText(inp[i].toFixed(2), x, y - 10);
            } else {
              ctx.textAlign = "right";
              ctx.fillText(inp[i].toFixed(2), x - 8, y);
            }
          }
        }
      }

      // Output: language names with probability bars, filling as each fires.
      const outLayer = layerCount - 1;
      const outPos = positions[outLayer];
      const probs = act ? act.layers[outLayer] : null;
      model.labels.forEach((label, i) => {
        const { x, y } = toScreen(outPos[i * 3], outPos[i * 3 + 1]);
        const k = layerOffset[outLayer] + i;
        const shown = firedNow(k) ? 1 : 0;
        const p = probs ? probs[i] * shown : 0;
        const isBest = i === best && done;
        ctx.font = `${isBest ? 700 : 400} ${vertical ? 11 : 14}px ${mono}`;
        ctx.fillStyle = isBest ? "#fde68a" : `rgba(154,165,204,${0.6 + 0.4 * p})`;
        if (vertical) {
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          const row = i % 2;
          ctx.fillText(label.name, x, y + 16 + row * 14);
          if (probs) {
            ctx.fillStyle = "rgba(42,55,101,0.9)";
            ctx.fillRect(x - 14, y + 10, 28, 3);
            ctx.fillStyle = isBest ? "#fde68a" : "rgba(125,211,252,0.7)";
            ctx.fillRect(x - 14, y + 10, 28 * p, 3);
            if (isBest) {
              ctx.font = `700 10px ${mono}`;
              ctx.fillText(`${(p * 100).toFixed(0)}%`, x, y + 46);
            }
          }
          ctx.textBaseline = "middle";
          return;
        }
        ctx.textAlign = "left";
        ctx.fillText(label.name, x + 20, y);
        if (probs) {
          const barX = x + 20 + ctx.measureText(label.name).width + 12;
          const barW = 90;
          ctx.fillStyle = "rgba(42,55,101,0.9)";
          ctx.fillRect(barX, y - 3, barW, 6);
          ctx.fillStyle = isBest ? "#fde68a" : "rgba(125,211,252,0.7)";
          ctx.fillRect(barX, y - 3, barW * p, 6);
          if (shown) {
            ctx.font = `${isBest ? 700 : 400} 11px ${mono}`;
            ctx.fillStyle = isBest ? "#fde68a" : `rgba(230,236,255,${0.4 + 0.6 * p})`;
            ctx.fillText(`${(p * 100).toFixed(0).padStart(3, " ")}%`, barX + barW + 10, y);
          }
        }
      });

      if (hovered >= 0) {
        const s = toScreen(neuronPos[hovered * 3], neuronPos[hovered * 3 + 1]);
        ctx.strokeStyle = "rgba(230,236,255,0.95)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 12, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    function loop(now: number) {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      if (needsRender) {
        needsRender = false;
        if (paint(now)) needsRender = true;
      }
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointercancel", onUp);
      renderer.domElement.removeEventListener("pointerleave", onLeave);
      fibreGeo.dispose();
      fibreMat.dispose();
      neuronGeo.dispose();
      neuronMat.dispose();
      (neuronMat.uniforms.uTex.value as THREE.Texture).dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [model, reducedMotion, vertical]);

  return (
    <div ref={hostRef} className={`relative ${className}`}>
      <canvas ref={labelRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />
    </div>
  );
}
