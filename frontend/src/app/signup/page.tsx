"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Alert } from "@/components/ui";
import { AuthShell } from "@/components/auth-shell";
import { PillInput } from "@/components/auth-input";
import { SocialButtons } from "@/components/social-buttons";
import { IconMail, IconLock, IconUser, IconArrowRight, IconCheck } from "@/components/icons";
import { PasswordStrength } from "@/components/password-strength";

type Status = "idle" | "loading" | "success";

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [shake, setShake] = useState(0);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");
    try {
      await register(name, email, password);
      setStatus("success");
      await new Promise((r) => setTimeout(r, 600));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setShake((s) => s + 1);
      setStatus("idle");
    }
  }

  return (
    <AuthShell
      heading="Create your account"
      subheading="Join your team's maintenance workspace"
    >
      <motion.form
        onSubmit={onSubmit}
        className="space-y-4"
        key={shake}
        initial={shake ? { x: 0 } : undefined}
        animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : undefined}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert>{error}</Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <PillInput
            icon={IconUser}
            label="Full name"
            type="text"
            id="name"
            autoComplete="name"
            placeholder="e.g. Ali Khan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <PillInput
            icon={IconLock}
            label="Password"
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
        </motion.div>

        <motion.button
          type="submit"
          disabled={status !== "idle"}
          initial={{ y: 12 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileTap={status === "idle" ? { scale: 0.985 } : undefined}
          className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-colors duration-300 hover:enabled:bg-[--color-primary-hover] disabled:cursor-not-allowed disabled:opacity-100"
          style={{
            backgroundColor: status === "success" ? "#16a34a" : "var(--color-primary)",
          }}
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
                Account created
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                Create Account
                <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.form>

      <SocialButtons />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-6 text-center text-sm text-[--color-text-subtle]"
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[--color-primary] hover:underline"
        >
          Sign in!
        </Link>
      </motion.p>
    </AuthShell>
  );
}
