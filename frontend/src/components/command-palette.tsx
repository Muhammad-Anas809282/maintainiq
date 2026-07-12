"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { api } from "@/lib/api";
import type { Asset, Issue, Paginated } from "@/lib/types";
import { IconSearch, IconAssets, IconIssues } from "@/components/icons";

interface Result {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  kind: "asset" | "issue";
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      return;
    }
    setLoading(true);
    try {
      const [assets, issues] = await Promise.all([
        api<Paginated<Asset>>(`/assets?search=${encodeURIComponent(q)}&limit=5`),
        api<Paginated<Issue>>(`/issues?search=${encodeURIComponent(q)}&limit=5`),
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
      ];
      setResults(r);
      setActive(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 220);
    return () => clearTimeout(t);
  }, [query, search]);

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

  return (
    <>
      {/* Trigger button (rendered by caller via <CommandTrigger/>) */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 pt-[12vh] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="w-full max-w-xl overflow-hidden rounded-2xl bg-[--color-surface] shadow-[--shadow-pop]"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b border-[--color-border] px-4">
                <IconSearch className="h-5 w-5 text-[--color-text-subtle]" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Search assets and issues…"
                  className="w-full bg-transparent py-4 text-sm text-[--color-text] outline-none placeholder:text-[--color-text-subtle]"
                />
                <kbd className="rounded border border-[--color-border] px-1.5 py-0.5 text-[10px] text-[--color-text-subtle]">
                  ESC
                </kbd>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {query && !loading && results.length === 0 && (
                  <p className="px-3 py-6 text-center text-sm text-[--color-text-subtle]">
                    No results for “{query}”.
                  </p>
                )}
                {!query && (
                  <p className="px-3 py-6 text-center text-sm text-[--color-text-subtle]">
                    Type to search assets and issues.
                  </p>
                )}
                {results.map((r, i) => {
                  const Icon = r.kind === "asset" ? IconAssets : IconIssues;
                  return (
                    <button
                      key={`${r.kind}-${r.id}`}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(r)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        active === i
                          ? "bg-[--color-primary-soft]"
                          : "hover:bg-[--color-surface-muted]"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-[--color-text-subtle]" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[--color-text]">
                          {r.title}
                        </p>
                        <p className="truncate text-xs text-[--color-text-subtle]">
                          {r.subtitle}
                        </p>
                      </div>
                      <span className="text-[10px] uppercase text-[--color-text-subtle]">
                        {r.kind}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
      className={`flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-[--color-sidebar-text] transition-colors hover:bg-white/10 ${className}`}
    >
      <IconSearch className="h-4 w-4" />
      <span className="flex-1 text-left">Search…</span>
      <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">⌘K</kbd>
    </button>
  );
}
