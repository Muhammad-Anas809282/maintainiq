"use client";

import { motion } from "motion/react";

/**
 * On-brand product illustration for the auth panel — a floating "asset page"
 * mockup with QR, status and an AI-triage chip. Pure SVG/markup, no 3D asset.
 */
export function AuthIllustration() {
  return (
    <div className="relative mx-auto flex w-full max-w-sm items-center justify-center">
      {/* main floating asset card */}
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: -3 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="animate-floaty w-64 rounded-2xl bg-white/95 p-4 shadow-[0_30px_60px_-20px_rgba(15,23,42,0.5)]"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold text-[--color-primary]">
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
        {/* faux QR */}
        <div className="mt-3 grid grid-cols-5 gap-1 rounded-lg bg-slate-50 p-3">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-[2px]"
              style={{
                background:
                  [0, 1, 2, 4, 5, 9, 10, 12, 14, 18, 20, 22, 23, 24].includes(i)
                    ? "#0b1220"
                    : "#e2e8f0",
              }}
            />
          ))}
        </div>
        <div className="mt-3 h-2 w-3/4 rounded-full bg-slate-200" />
        <div className="mt-2 h-2 w-1/2 rounded-full bg-slate-100" />
      </motion.div>

      {/* floating AI-triage chip */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="animate-floaty-slow absolute -right-2 top-2 rounded-xl bg-white/95 px-3 py-2 shadow-[0_20px_40px_-16px_rgba(15,23,42,0.45)]"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[--color-primary-soft]">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4f46e5"
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
            <p className="text-[9px] text-slate-500">Priority: High</p>
          </div>
        </div>
      </motion.div>

      {/* floating gauge chip */}
      <motion.div
        initial={{ opacity: 0, x: -20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="animate-floaty absolute -bottom-4 -left-3 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 shadow-[0_20px_40px_-16px_rgba(15,23,42,0.45)]"
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
    </div>
  );
}
