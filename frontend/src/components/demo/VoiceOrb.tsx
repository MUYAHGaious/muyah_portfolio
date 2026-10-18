"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * A 3D voice orb: a sphere of points that rests when idle, breathes while
 * listening, shimmers while transcribing or thinking, and ripples outward
 * while speaking. The colour follows the stage. Rendered small and on demand;
 * it only animates while a stage is active, and is still under reduced motion.
 */

export type OrbStage = "idle" | "listening" | "transcribing" | "thinking" | "speaking";

const STAGE_COLOUR: Record<OrbStage, string> = {
  idle: "#9aa5cc",
  listening: "#7dd3fc",
  transcribing: "#e6ecff",
  thinking: "#f9a8d4",
  speaking: "#fde68a",
};

const POINTS = 2600;

export function VoiceOrb({ stage, className = "" }: { stage: OrbStage; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<OrbStage>(stage);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    const hostEl = hostRef.current;
    if (!hostEl) return;
    const host: HTMLDivElement = hostEl;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Points on a sphere (Fibonacci spiral) so they are evenly spread.
    const base = new Float32Array(POINTS * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < POINTS; i++) {
      const y = 1 - (i / (POINTS - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      base[i * 3] = Math.cos(theta) * r;
      base[i * 3 + 1] = y;
      base[i * 3 + 2] = Math.sin(theta) * r;
    }
    const positions = Float32Array.from(base);
    const geometry = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(positions, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("position", posAttr);

    const material = new THREE.PointsMaterial({
      size: 0.028,
      color: new THREE.Color(STAGE_COLOUR.idle),
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const points = new THREE.Points(geometry, material);

    // A faint inner core so the orb reads as solid from a distance.
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 32, 32),
      new THREE.MeshBasicMaterial({ color: new THREE.Color("#0b1230"), transparent: true, opacity: 0.85 }),
    );

    const scene = new THREE.Scene();
    scene.add(core, points);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
    camera.position.set(0, 0, 3.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    host.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, { position: "absolute", inset: "0", width: "100%", height: "100%" });

    function resize() {
      const r = host.getBoundingClientRect();
      renderer.setSize(Math.max(1, r.width), Math.max(1, r.height), false);
      camera.aspect = r.width / Math.max(1, r.height);
      camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    const target = new THREE.Color();
    let level = 0; // how disturbed the surface is, 0 rest .. 1 full
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(host);

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const s = stageRef.current;
      const want = s === "idle" ? 0 : s === "listening" ? 0.35 : s === "speaking" ? 1 : 0.55;
      level += (want - level) * 0.08;
      target.set(STAGE_COLOUR[s]);
      material.color.lerp(target, 0.08);

      const t = now / 1000;
      const speakWave = s === "speaking" ? 1 : 0;
      for (let i = 0; i < POINTS; i++) {
        const x = base[i * 3];
        const y = base[i * 3 + 1];
        const z = base[i * 3 + 2];
        // Layered sines stand in for noise: cheap and smooth.
        const n =
          Math.sin(x * 3.1 + t * 1.7) * Math.sin(y * 2.7 - t * 1.3) +
          0.6 * Math.sin(z * 4.3 + t * 2.1 + x * 2) +
          speakWave * 0.9 * Math.sin((y + x) * 9 - t * 7); // fast ripples while speaking
        const breathe = s === "listening" ? 0.04 * Math.sin(t * 2.2) : 0;
        const r = 1 + breathe + (reduced ? 0 : level * 0.16 * n);
        positions[i * 3] = x * r;
        positions[i * 3 + 1] = y * r;
        positions[i * 3 + 2] = z * r;
      }
      posAttr.needsUpdate = true;
      points.rotation.y = reduced ? 0 : t * 0.18;
      points.rotation.x = reduced ? 0 : Math.sin(t * 0.3) * 0.12;
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      geometry.dispose();
      material.dispose();
      core.geometry.dispose();
      (core.material as THREE.Material).dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} className={`relative ${className}`} aria-hidden="true" />;
}
