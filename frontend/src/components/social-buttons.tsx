"use client";

import { motion } from "motion/react";
import { API_URL } from "@/lib/api";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export function SocialButtons() {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-xs text-[var(--color-text-subtle)]">
          or continue with
        </span>
        <span className="h-px flex-1 bg-[var(--color-border)]" />
      </div>
      <motion.a
        href={`${API_URL}/auth/google`}
        aria-label="Continue with Google"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] py-3 text-sm font-semibold text-[var(--color-text)] shadow-[var(--shadow-card)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-muted)]"
      >
        <GoogleIcon />
        Continue with Google
      </motion.a>
    </div>
  );
}
