"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { IconLogo, IconCheck } from "@/components/icons";

const POINTS = [
  "QR-accessible asset pages",
  "AI-assisted issue triage",
  "Complete maintenance history",
];

export function AuthShell({
  children,
  heading,
  subheading,
}: {
  children: ReactNode;
  heading: string;
  subheading: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div
        className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12"
        style={{ background: "var(--gradient-brand)" }}
      >
        {/* floating accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-floaty absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="animate-floaty-slow absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex items-center gap-2.5 text-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <IconLogo className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            MaintainIQ
          </span>
        </motion.div>

        <div className="relative">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl font-bold leading-tight text-white"
          >
            Give every asset a<br />
            digital identity.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 max-w-sm text-base text-white/80"
          >
            AI-powered QR maintenance and asset-history platform for teams that
            care about accountability.
          </motion.p>
          <ul className="mt-8 space-y-3">
            {POINTS.map((p, i) => (
              <motion.li
                key={p}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 text-white/90"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  <IconCheck className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm font-medium">{p}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="relative text-xs text-white/60"
        >
          SMIT Final Hackathon · Track A
        </motion.p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-[--color-bg] px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {/* mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[--color-primary] text-white">
              <IconLogo className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold text-[--color-text]">
              MaintainIQ
            </span>
          </div>

          <h1 className="font-display text-2xl font-bold tracking-tight text-[--color-text]">
            {heading}
          </h1>
          <p className="mt-1.5 text-sm text-[--color-text-subtle]">
            {subheading}
          </p>

          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
