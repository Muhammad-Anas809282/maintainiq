"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { api, ApiError } from "@/lib/api";
import { AuthShell } from "@/components/auth-shell";
import { PillInput } from "@/components/auth-input";
import { PasswordStrength } from "@/components/password-strength";
import { IconLock, IconArrowRight, IconCheck } from "@/components/icons";

type Status = "idle" | "loading" | "success";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("Missing or invalid reset link.");
      return;
    }
    setStatus("loading");
    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: { token, password },
        auth: false,
      });
      setStatus("success");
      await new Promise((r) => setTimeout(r, 900));
      router.push("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setStatus("idle");
    }
  }

  return (
    <AuthShell heading="Set a new password" subheading="Choose a strong password for your account">
      {!token ? (
        <p className="rounded-lg bg-[--color-danger-soft] px-4 py-3 text-sm font-medium text-[--color-danger]">
          This reset link is invalid or missing. Please request a new one.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <p className="rounded-lg bg-[--color-danger-soft] px-4 py-3 text-sm font-medium text-[--color-danger]">
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <PillInput
              icon={IconLock}
              label="New password"
              type="password"
              id="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <AnimatePresence>
              <PasswordStrength password={password} />
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={status !== "idle"}
            className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-colors duration-300 hover:enabled:bg-[--color-primary-hover] disabled:cursor-not-allowed disabled:opacity-100"
            style={{ backgroundColor: status === "success" ? "#16a34a" : "var(--color-primary)" }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {status === "loading" ? (
                <motion.span
                  key="spin"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
              ) : status === "success" ? (
                <motion.span
                  key="check"
                  initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 20 }}
                  className="flex items-center gap-2"
                >
                  <IconCheck className="h-4 w-4" />
                  Password updated
                </motion.span>
              ) : (
                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  Reset password
                  <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-[--color-text-subtle]">
        <Link href="/login" className="font-semibold text-[--color-primary] hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
