"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import type { ReactNode } from "react";
import { AuthIllustration } from "@/components/auth-illustration";
import { IconCheck } from "@/components/icons";

const trustPoints = [
  "Instant QR-based asset lookup",
  "AI-assisted issue triage",
  "Permanent, audit-ready history",
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
  const reduce = useReducedMotion();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — clean, professional, no gimmicks */}
      <div
        className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-14"
        style={{ background: "var(--gradient-auth-panel)" }}
      >
        {/* Fine grain texture — premium, non-flat surface */}
        <div className="grain pointer-events-none absolute inset-0 opacity-[0.05]" />

        {/* Faint structural grid — subtle, professional texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        {/* Living mesh glows — slow independent drift, reduced-motion safe */}
        <motion.div
          className="pointer-events-none absolute -right-40 -top-40 h-[460px] w-[460px] rounded-full bg-[#3b82f6] opacity-[0.22] blur-[120px]"
          animate={reduce ? undefined : { x: [0, 34, -10, 0], y: [0, -22, 18, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-32 -left-24 h-[400px] w-[400px] rounded-full bg-[#22c55e] opacity-[0.16] blur-[120px]"
          animate={reduce ? undefined : { x: [0, -26, 16, 0], y: [0, 20, -16, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="pointer-events-none absolute right-1/4 top-1/3 h-[260px] w-[260px] rounded-full bg-[#7c3aed] opacity-[0.14] blur-[100px]"
          animate={reduce ? undefined : { x: [0, 18, -18, 0], y: [0, -14, 14, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <Image
            src="/logo.png"
            alt="MaintainIQ"
            width={865}
            height={289}
            priority
            className="h-8 w-auto select-none"
          />
        </motion.div>

        <div className="relative">
          <AuthIllustration />
        </div>

        <div className="relative">
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="font-display max-w-md text-[34px] font-bold leading-[1.15] tracking-tight text-white"
          >
            Give every asset a digital identity.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
            className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/55"
          >
            AI-powered QR maintenance and asset-history platform for teams
            that care about accountability.
          </motion.p>

          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } },
            }}
            className="mt-7 space-y-3"
          >
            {trustPoints.map((point) => (
              <motion.li
                key={point}
                variants={{
                  hidden: { opacity: 0, x: -8 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="flex items-center gap-2.5 text-sm text-white/75"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#22c55e]/15">
                  <IconCheck className="h-3 w-3 text-[#4ade80]" />
                </span>
                {point}
              </motion.li>
            ))}
          </motion.ul>

          <div className="mt-9 flex items-center gap-8 border-t border-white/10 pt-7">
            {[
              { k: "AI", v: "Triage" },
              { k: "QR", v: "Access" },
              { k: "100%", v: "History" },
            ].map((s, i) => (
              <motion.div
                key={s.v}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.55 + i * 0.08 }}
              >
                <p className="font-display text-xl font-bold tracking-tight text-white">
                  {s.k}
                </p>
                <p className="text-xs text-white/45">{s.v}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-[--color-surface] px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[380px]"
        >
          <div className="mb-9 lg:hidden">
            <Image
              src="/logo.png"
              alt="MaintainIQ"
              width={865}
              height={289}
              priority
              className="h-8 w-auto select-none"
            />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="font-display text-[28px] font-bold tracking-tight text-[--color-text]"
          >
            {heading}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.13 }}
            className="mt-2 text-sm text-[--color-text-subtle]"
          >
            {subheading}
          </motion.p>

          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
