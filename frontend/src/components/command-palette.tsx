"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { api } from "@/lib/api";
import type { Asset, AuthUser, Issue, Paginated } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { IconSearch, IconAssets, IconIssues, IconUsers } from "@/components/icons";

interface Result {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  kind: "asset" | "issue" | "user";
}

export function CommandPalette() {
  const router = useRouter();
  const { user } = useAuth();
  const canSearchUsers = user?.role === "ADMIN" || user?.role === "SUPERVISOR";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global Cmd/Ctrl+K toggle.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
    else {
      setQuery("");
      setResults([]);
      setActive(0);
    }
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 1) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [assets, issues, users] = await Promise.all([
        api<Paginated<Asset>>(`/assets?search=${encodeURIComponent(q)}&limit=5`),
        api<Paginated<Issue>>(`/issues?search=${encodeURIComponent(q)}&limit=5`),
        canSearchUsers
          ? api<AuthUser[]>(`/users?search=${encodeURIComponent(q)}`).catch(() => [])
          : Promise.resolve([] as AuthUser[]),
      ]);
      const r: Result[] = [
        ...assets.data.map((a) => ({
          id: a.id,
          href: `/assets/${a.id}`,
          title: a.name,
          subtitle: `${a.code} · ${a.location}`,
          kind: "asset" as const,
        })),
        ...issues.data.map((i) => ({
          id: i.id,
          href: `/issues/${i.id}`,
          title: i.title,
          subtitle: `${i.number}${i.asset ? ` · ${i.asset.code}` : ""}`,
          kind: "issue" as const,
        })),
        ...users.slice(0, 5).map((u) => ({
          id: u.id,
          href: `/users`,
          title: u.name,
          subtitle: `${u.email} · ${u.role}`,
          kind: "user" as const,
        })),
      ];
      setResults(r);
      setActive(0);
    } finally {
      setLoading(false);
    }
  }, [canSearchUsers]);

  useEffect(() => {
    const t = setTimeout(() => search(query), 220);
    return () => clearTimeout(t);
  }, [query, search]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(r: Result) {
    setOpen(false);
    router.push(r.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      go(results[active]);
    }
  }

  const assetResults = results.filter((r) => r.kind === "asset");
  const issueResults = results.filter((r) => r.kind === "issue");
  const userResults = results.filter((r) => r.kind === "user");

  return (
    <>
      {/* Trigger button (rendered by caller via <CommandTrigger/>) */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 p-4 pt-[12vh] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="glass-strong w-full max-w-xl overflow-hidden rounded-2xl shadow-[var(--shadow-pop)]"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4">
                <IconSearch className="h-5 w-5 shrink-0 text-[var(--color-text-subtle)]" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Search assets and issues…"
                  aria-label="Search assets and issues"
                  className="w-full bg-transparent py-4 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-subtle)]"
                />
                {loading ? (
                  <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-primary)]" />
                ) : (
                  <kbd className="shrink-0 rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-subtle)]">
                    ESC
                  </kbd>
                )}
              </div>

              <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
                {query && !loading && results.length === 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-3 py-8 text-center text-sm text-[var(--color-text-subtle)]"
                  >
                    No results for &ldquo;{query}&rdquo;.
                  </motion.p>
                )}
                {!query && (
                  <p className="px-3 py-8 text-center text-sm text-[var(--color-text-subtle)]">
                    Type to search assets and issues.
                  </p>
                )}

                {assetResults.length > 0 && (
                  <ResultGroup label="Assets">
                    {assetResults.map((r) => {
                      const idx = results.indexOf(r);
                      return (
                        <ResultRow
                          key={`${r.kind}-${r.id}`}
                          idx={idx}
                          active={active === idx}
                          onHover={() => setActive(idx)}
                          onSelect={() => go(r)}
                          icon={IconAssets}
                          result={r}
                        />
                      );
                    })}
                  </ResultGroup>
                )}

                {issueResults.length > 0 && (
                  <ResultGroup label="Issues">
                    {issueResults.map((r) => {
                      const idx = results.indexOf(r);
                      return (
                        <ResultRow
                          key={`${r.kind}-${r.id}`}
                          idx={idx}
                          active={active === idx}
                          onHover={() => setActive(idx)}
                          onSelect={() => go(r)}
                          icon={IconIssues}
                          result={r}
                        />
                      );
                    })}
                  </ResultGroup>
                )}

                {userResults.length > 0 && (
                  <ResultGroup label="Team">
                    {userResults.map((r) => {
                      const idx = results.indexOf(r);
                      return (
                        <ResultRow
                          key={`${r.kind}-${r.id}`}
                          idx={idx}
                          active={active === idx}
                          onHover={() => setActive(idx)}
                          onSelect={() => go(r)}
                          icon={IconUsers}
                          result={r}
                        />
                      );
                    })}
                  </ResultGroup>
                )}
              </div>

              {results.length > 0 && (
                <div className="flex items-center gap-4 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2.5 text-[11px] text-[var(--color-text-subtle)]">
                  <span className="flex items-center gap-1.5">
                    <kbd className="rounded border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-1.5 py-0.5 font-sans">
                      ↑↓
                    </kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="rounded border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-1.5 py-0.5 font-sans">
                      ↵
                    </kbd>
                    Open
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ResultGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1 last:mb-0">
      <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
        {label}
      </p>
      {children}
    </div>
  );
}

function ResultRow({
  idx,
  active,
  onHover,
  onSelect,
  icon: Icon,
  result,
}: {
  idx: number;
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
  icon: React.ComponentType<{ className?: string }>;
  result: Result;
}) {
  return (
    <motion.button
      data-idx={idx}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      onMouseEnter={onHover}
      onClick={onSelect}
      className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
        active ? "bg-[var(--color-primary-soft)]" : "hover:bg-[var(--color-surface-muted)]"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          active ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface-muted)]"
        }`}
      >
        <Icon
          className={`h-4 w-4 ${active ? "text-white" : "text-[var(--color-text-subtle)]"}`}
        />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--color-text)]">
          {result.title}
        </p>
        <p className="truncate text-xs text-[var(--color-text-subtle)]">
          {result.subtitle}
        </p>
      </div>
    </motion.button>
  );
}

/** Sidebar/topbar trigger that opens the palette (dispatches the ⌘K event). */
export function CommandTrigger({ className = "" }: { className?: string }) {
  function open() {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true }),
    );
  }
  return (
    <button
      onClick={open}
      className={`flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-[#8b97b0] transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white ${className}`}
    >
      <IconSearch className="h-4 w-4" />
      <span className="flex-1 text-left">Search assets, issues…</span>
      <kbd className="rounded border border-white/10 bg-white/10 px-1.5 py-0.5 text-[10px] text-white/70">
        ⌘K
      </kbd>
    </button>
  );
}
