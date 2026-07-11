"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/lib/auth";
import { Spinner } from "@/components/ui";
import {
  IconDashboard,
  IconAssets,
  IconIssues,
  IconLogout,
  IconLogo,
} from "@/components/icons";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { href: "/assets", label: "Assets", icon: IconAssets },
  { href: "/issues", label: "Issues", icon: IconIssues },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[--color-text-subtle]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
      {/* Sidebar (deep slate) */}
      <aside className="hidden bg-[--color-sidebar] lg:flex lg:flex-col">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
            <IconLogo className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-[--color-sidebar-text-strong]">
            MaintainIQ
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200"
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-[--color-sidebar-active]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span
                  className={`relative z-10 flex items-center gap-3 ${
                    active
                      ? "text-[--color-sidebar-text-strong]"
                      : "text-[--color-sidebar-text] hover:text-[--color-sidebar-text-strong]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3">
          <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[--color-sidebar-text-strong]">
                {user.name}
              </p>
              <p className="truncate text-xs text-[--color-sidebar-text]">
                {user.role}
              </p>
            </div>
            <button
              onClick={logout}
              aria-label="Sign out"
              className="cursor-pointer rounded-lg p-2 text-[--color-sidebar-text] transition-colors hover:bg-white/10 hover:text-white"
            >
              <IconLogout className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-col">
        {/* Mobile top nav */}
        <header className="flex items-center justify-between bg-[--color-sidebar] px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
              <IconLogo className="h-4 w-4" />
            </div>
            <span className="font-display font-bold text-[--color-sidebar-text-strong]">
              MaintainIQ
            </span>
          </div>
          <button
            onClick={logout}
            aria-label="Sign out"
            className="cursor-pointer rounded-lg p-2 text-[--color-sidebar-text] hover:bg-white/10"
          >
            <IconLogout className="h-5 w-5" />
          </button>
        </header>

        <nav className="flex gap-1 border-b border-[--color-border] bg-[--color-surface] px-2 py-2 lg:hidden">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium ${
                  active
                    ? "bg-[--color-primary-soft] text-[--color-primary]"
                    : "text-[--color-text-muted]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
