"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { AuthUser, UserRole } from "@/lib/types";
import {
  Card,
  Badge,
  Button,
  Field,
  Input,
  Skeleton,
  EmptyState,
} from "@/components/ui";
import { SelectMenu } from "@/components/select-menu";
import { Reveal, motion } from "@/components/motion";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/toast";

const ROLE_TONE: Record<UserRole, "primary" | "info" | "warning" | "neutral"> = {
  ADMIN: "primary",
  SUPERVISOR: "warning",
  TECHNICIAN: "info",
  REPORTER: "neutral",
};

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [users, setUsers] = useState<AuthUser[] | null>(null);

  const load = useCallback(async () => {
    try {
      setUsers(await api<AuthUser[]>("/users"));
    } catch {
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    if (user && user.role !== "ADMIN") router.replace("/dashboard");
  }, [user, router]);

  useEffect(() => {
    load();
  }, [load]);

  if (user?.role !== "ADMIN") return null;

  return (
    <div className="space-y-6">
      <Reveal trigger="mount">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--color-text)]">
          Team
        </h1>
        <p className="mt-1.5 text-sm text-[var(--color-text-subtle)]">
          Manage administrators, supervisors and technicians.
        </p>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Reveal trigger="mount">
          {!users ? (
            <Skeleton className="h-72" />
          ) : users.length === 0 ? (
            <EmptyState title="No users found" />
          ) : (
            <Card glass className="overflow-hidden">
              <ul className="divide-y divide-white/50">
                {users.map((u, i) => (
                  <motion.li
                    key={u.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.3 }}
                    className="flex cursor-default items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--color-surface-muted)]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.08 }}
                        transition={{ type: "spring", stiffness: 400, damping: 18 }}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-sm font-bold text-[var(--color-primary)]"
                      >
                        {u.name.charAt(0).toUpperCase()}
                      </motion.div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                          {u.name}
                        </p>
                        <p className="truncate text-xs text-[var(--color-text-subtle)]">
                          {u.email}
                        </p>
                      </div>
                    </div>
                    <Badge tone={ROLE_TONE[u.role]}>{u.role}</Badge>
                  </motion.li>
                ))}
              </ul>
            </Card>
          )}
        </Reveal>

        <Reveal delay={0.05} trigger="mount">
          <CreateUserForm onCreated={load} notify={toast} />
        </Reveal>
      </div>
    </div>
  );
}

function CreateUserForm({
  onCreated,
  notify,
}: {
  onCreated: () => Promise<void>;
  notify: (m: string, t?: "success" | "error" | "info") => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "TECHNICIAN" as UserRole,
  });
  const [loading, setLoading] = useState(false);

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/auth/users", { method: "POST", body: form });
      setForm({ name: "", email: "", password: "", role: "TECHNICIAN" });
      await onCreated();
      notify("User created", "success");
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card glass className="p-5">
      <h2 className="font-display text-base font-semibold text-[var(--color-text)]">
        Add member
      </h2>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <Field label="Full name" htmlFor="u-name">
          <Input
            id="u-name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </Field>
        <Field label="Email" htmlFor="u-email">
          <Input
            id="u-email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
          />
        </Field>
        <Field label="Password" htmlFor="u-pass" hint="At least 6 characters">
          <Input
            id="u-pass"
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            required
          />
        </Field>
        <Field label="Role" htmlFor="u-role">
          <SelectMenu
            id="u-role"
            value={form.role}
            onChange={(v) => set("role", v)}
            ariaLabel="Role"
            options={[
              { value: "TECHNICIAN", label: "Technician" },
              { value: "SUPERVISOR", label: "Supervisor" },
              { value: "ADMIN", label: "Administrator" },
            ]}
          />
        </Field>
        <Button type="submit" loading={loading} className="w-full">
          Create user
        </Button>
      </form>
    </Card>
  );
}
