"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Button, Field, Input, Alert } from "@/components/ui";
import { AuthShell } from "@/components/auth-shell";
import { SocialButtons } from "@/components/social-buttons";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("admin@maintainiq.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell heading="Welcome back" subheading="Sign in to the maintenance console">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <Button type="submit" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>

      <SocialButtons />

      <p className="mt-6 text-center text-sm text-[--color-text-subtle]">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-[--color-primary] hover:underline"
        >
          Create one
        </Link>
      </p>

      <div className="mt-6 rounded-lg bg-[--color-surface] p-3 text-xs text-[--color-text-muted] shadow-[--shadow-card]">
        <p className="font-semibold text-[--color-text]">Demo credentials</p>
        <p className="mt-1">admin@maintainiq.com / Admin@123</p>
        <p>tech@maintainiq.com / Tech@123</p>
      </div>
    </AuthShell>
  );
}
