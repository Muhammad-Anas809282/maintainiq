"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { api, ApiError } from "@/lib/api";
import { AuthShell } from "@/components/auth-shell";
import { PillInput } from "@/components/auth-input";
import { IconMail, IconArrowRight, IconCheck } from "@/components/icons";

type Status = "idle" | "loading" | "sent";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");
    try {
      await api("/auth/forgot-password", {
        method: "POST",
        body: { email },
        auth: false,
      });
      setStatus("sent");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setStatus("idle");
    }
  }

  return (
    <AuthShell
      heading="Reset your password"
      subheading="Enter your email and we'll send you a reset link"
    >
      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-[var(--color-success-soft)] p-5 text-center"
          >
            <motion.div
              initial={{ scale: 0.4, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
              className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-success)]"
            >
              <IconCheck className="h-5 w-5 text-white" />
            </motion.div>
            <p className="mt-3 text-sm font-semibold text-[var(--color-text)]">
              Check your inbox
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-subtle)]">
              If an account exists for <b>{email}</b>, a reset link is on its
              way. The link expires in 30 minutes.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                <p className="rounded-lg bg-[var(--color-danger-soft)] px-4 py-3 text-sm font-medium text-[var(--color-danger)]">
                  {error}
                </p>
              </motion.div>
            )}

            <PillInput
              icon={IconMail}
              label="Email address"
              type="email"
              id="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={status === "loading"}
              className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-colors duration-200 hover:enabled:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {status === "loading" ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <>
                  Send reset link
                  <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <p className="mt-6 text-center text-sm text-[var(--color-text-subtle)]">
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
