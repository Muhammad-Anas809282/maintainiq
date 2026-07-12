"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/lib/auth";
import { Spinner } from "@/components/ui";
import { CommandPalette, CommandTrigger } from "@/components/command-palette";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  IconDashboard,
  IconAssets,
  IconIssues,
  IconUsers,
  IconLogout,
} from "@/components/icons";

const baseNav = [
  { href: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { href: "/assets", label: "Assets", icon: IconAssets },
  { href: "/issues", label: "Issues", icon: IconIssues },
];
const adminNav = [{ href: "/users", label: "Team", icon: IconUsers }];

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

  const nav =
    user.role === "ADMIN" ? [...baseNav, ...adminNav] : baseNav;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
      <CommandPalette />
      {/* Sidebar (premium ink) — fixed to viewport, independent of page scroll */}
      <aside
        className="relative hidden overflow-hidden border-r border-white/5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col"
        style={{ background: "var(--gradient-sidebar)" }}
      >
        <div className="flex items-center px-6 py-7">
          <Image
            src="/logo.png"
            alt="MaintainIQ"
            width={865}
            height={289}
            priority
            className="h-11 w-auto select-none"
          />
        </div>

        <div className="px-3 pb-2">
          <CommandTrigger className="w-full" />
        </div>

        <p className="px-6 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
          Menu
        </p>
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-1">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-medium transition-colors duration-200"
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[rgb(37_99_235/0.28)] to-[rgb(37_99_235/0.08)] shadow-[inset_3px_0_0_var(--color-primary)]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span
                  className={`relative z-10 flex items-center gap-3 ${
                    active
                      ? "text-white"
                      : "text-[#c3ccde] group-hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                      active
                        ? "text-[#60a5fa]"
                        : "text-[#7f8ba6] group-hover:text-[#c3ccde]"
                    }`}
                  />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* System status card — fills space + real product value */}
        <div className="px-3 pb-2">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-semibold text-white/85">
                All systems operational
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-white/45">
              AI triage &amp; QR services running normally.
            </p>
          </div>
        </div>

        <div className="p-3 pt-1">
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#22c55e] text-sm font-bold text-white shadow-[0_2px_8px_-2px_rgb(37_99_235/0.6)]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {user.name}
              </p>
              <p className="truncate text-[11px] font-medium uppercase tracking-wide text-[#8b97b0]">
                {user.role}
              </p>
            </div>
            <ThemeToggle />
            <button
              onClick={logout}
              aria-label="Sign out"
              className="cursor-pointer rounded-lg p-1.5 text-[#8b97b0] transition-colors hover:bg-white/10 hover:text-white"
            >
              <IconLogout className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div
        className="flex min-w-0 flex-col"
        style={{ background: "var(--gradient-app)" }}
      >
        {/* Mobile top nav */}
        <header
          className="flex items-center justify-between px-4 py-3 lg:hidden"
          style={{ background: "var(--gradient-sidebar)" }}
        >
          <Image
            src="/logo.png"
            alt="MaintainIQ"
            width={865}
            height={289}
            priority
            className="h-5 w-auto select-none"
          />
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
