"use client";

import { motion } from "motion/react";

function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "transparent" };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "#dc2626" };
  if (score <= 2) return { score: 2, label: "Fair", color: "#d97706" };
  if (score <= 3) return { score: 3, label: "Good", color: "#0ea5e9" };
  return { score: 4, label: "Strong", color: "#16a34a" };
}

export function PasswordStrength({ password }: { password: string }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2 flex items-center gap-2.5 overflow-hidden"
    >
      <div className="flex flex-1 gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 overflow-hidden rounded-full bg-[--color-surface-muted]"
          >
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: i <= score ? "100%" : "0%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ background: color }}
            />
          </div>
        ))}
      </div>
      <motion.span
        key={label}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[11px] font-semibold"
        style={{ color }}
      >
        {label}
      </motion.span>
    </motion.div>
  );
}
