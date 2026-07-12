"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { useAuth } from "@/lib/auth";
import { Spinner } from "@/components/ui";

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setError("Missing sign-in token.");
      return;
    }
    loginWithToken(token)
      .then(() => router.replace("/dashboard"))
      .catch(() => setError("Sign-in failed. Please try again."));
  }, [params, loginWithToken, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-bg)] px-6 text-center">
      {error ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-sm font-medium text-[var(--color-danger)]">{error}</p>
          <a
            href="/login"
            className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
          >
            Back to sign in
          </a>
        </motion.div>
      ) : (
        <>
          <Spinner className="h-6 w-6 text-[var(--color-primary)]" />
          <p className="text-sm text-[var(--color-text-subtle)]">Signing you in…</p>
        </>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackHandler />
    </Suspense>
  );
}
