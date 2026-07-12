"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";

const PRIORITIES = [
  { label: "High", color: "#dc2626" },
  { label: "Medium", color: "#d97706" },
  { label: "Low", color: "#16a34a" },
];

// Deterministic, scannable-looking QR mock: real finder-pattern "eyes" in
// three corners (like an actual QR code) plus pseudo-random data modules —
// no gaps between modules, matching real QR rendering.
const QR_SIZE = 15;
const FINDER_ZONES: [number, number][] = [
  [0, 0],
  [0, QR_SIZE - 5],
  [QR_SIZE - 5, 0],
];

function isDarkModule(r: number, c: number): boolean {
  for (const [zr, zc] of FINDER_ZONES) {
    if (r >= zr && r < zr + 5 && c >= zc && c < zc + 5) {
      const lr = r - zr;
      const lc = c - zc;
      return lr === 0 || lr === 4 || lc === 0 || lc === 4 || (lr === 2 && lc === 2);
    }
  }
  // Alignment-pattern-style dot near bottom-right, like real QR codes
  if (r >= QR_SIZE - 4 && r < QR_SIZE - 1 && c >= QR_SIZE - 4 && c < QR_SIZE - 1) {
    const lr = r - (QR_SIZE - 4);
    const lc = c - (QR_SIZE - 4);
    return lr === 0 || lr === 2 || lc === 0 || lc === 2 || (lr === 1 && lc === 1);
  }
  // Deterministic pseudo-random fill for data modules
  return (r * 7 + c * 13 + r * c * 3) % 5 < 2;
}

const QR_MODULES = Array.from({ length: QR_SIZE }, (_, r) =>
  Array.from({ length: QR_SIZE }, (_, c) => isDarkModule(r, c)),
);

/**
 * On-brand product illustration for the auth panel — a floating "asset page"
 * mockup with QR, status and an AI-triage chip. Pure SVG/markup, no 3D asset.
 * Reacts to pointer movement with a subtle 3D parallax tilt.
 */
export function AuthIllustration() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [priorityIdx, setPriorityIdx] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setPriorityIdx((i) => (i + 1) % PRIORITIES.length), 2200);
    return () => clearInterval(t);
  }, [reduce]);

  const priority = PRIORITIES[priorityIdx];
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-8, 8]), {
    stiffness: 150,
    damping: 20,
  });

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function onPointerLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ perspective: 900 }}
      className="relative mx-auto flex w-full max-w-sm items-center justify-center"
    >
      <motion.div
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full"
      >
        {/* main floating asset card */}
        <motion.div
          initial={{ opacity: 0, y: 24, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: -3 }}
          whileHover={reduce ? undefined : { scale: 1.03, rotate: -1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="animate-floaty mx-auto w-64 cursor-default rounded-2xl bg-white/95 p-4 shadow-[0_30px_60px_-20px_rgba(15,23,42,0.5)] transition-shadow duration-300 hover:shadow-[0_36px_70px_-16px_rgba(15,23,42,0.6)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] font-bold text-[var(--color-primary)]">
                AST-0001
              </p>
              <p className="font-display text-sm font-bold text-slate-900">
                Projector 01
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              Operational
            </span>
          </div>
          {/* Realistic QR mock — proper finder-pattern corners, animated scan line */}
          <div className="relative mt-3 overflow-hidden rounded-lg bg-white p-2.5">
            {!reduce && (
              <motion.div
                className="pointer-events-none absolute inset-x-0 z-10 h-7"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 0%, rgb(200 162 92 / 0.45) 50%, transparent 100%)",
                }}
                animate={{ top: ["0%", "94%", "0%"] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${QR_SIZE}, 1fr)` }}
            >
              {QR_MODULES.map((row, r) =>
                row.map((dark, c) => (
                  <div
                    key={`${r}-${c}`}
                    className="aspect-square"
                    style={{ background: dark ? "#0b1220" : "transparent" }}
                  />
                )),
              )}
            </div>
          </div>
          <div className="mt-3 h-2 w-3/4 rounded-full bg-slate-200" />
          <div className="mt-2 h-2 w-1/2 rounded-full bg-slate-100" />
        </motion.div>

        {/* floating AI-triage chip */}
        <motion.div
          initial={{ opacity: 0, x: 20, y: -10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          whileHover={reduce ? undefined : { scale: 1.06 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="animate-floaty-slow absolute -right-2 top-2 cursor-default rounded-xl bg-white/95 px-3 py-2 shadow-[0_20px_40px_-16px_rgba(15,23,42,0.45)]"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--color-primary-soft)]">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8f6425"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
                <path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4z" />
              </svg>
            </span>
            <div>
              <p className="text-[10px] font-bold text-slate-900">AI Triage</p>
              <div className="flex items-center gap-1 text-[9px] text-slate-500">
                <span>Priority:</span>
                <span className="relative inline-flex h-[11px] w-11 items-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={priority.label}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3 }}
                      className="absolute font-semibold"
                      style={{ color: priority.color }}
                    >
                      {priority.label}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* floating gauge chip */}
        <motion.div
          initial={{ opacity: 0, x: -20, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          whileHover={reduce ? undefined : { scale: 1.06 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="animate-floaty absolute -bottom-4 -left-3 flex cursor-default items-center gap-2 rounded-xl bg-white/95 px-3 py-2 shadow-[0_20px_40px_-16px_rgba(15,23,42,0.45)]"
        >
          <svg width="34" height="34" viewBox="0 0 36 36" className="-rotate-90">
            <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="4" />
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="#16a34a"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="66 88"
            />
          </svg>
          <div>
            <p className="text-[10px] font-bold text-slate-900">76%</p>
            <p className="text-[9px] text-slate-500">Uptime</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
