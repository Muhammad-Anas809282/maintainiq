"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Asset, AssetStatus, Paginated } from "@/lib/types";
import {
  Card,
  Badge,
  Input,
  LinkButton,
  Skeleton,
  EmptyState,
} from "@/components/ui";
import { SelectMenu } from "@/components/select-menu";
import { Reveal, motion } from "@/components/motion";
import { IconPlus, IconSearch, IconQr } from "@/components/icons";
import { assetStatusMeta, formatDateShort } from "@/lib/labels";
import { useAuth } from "@/lib/auth";

const STATUS_OPTIONS: AssetStatus[] = [
  "OPERATIONAL",
  "ISSUE_REPORTED",
  "UNDER_INSPECTION",
  "UNDER_MAINTENANCE",
  "OUT_OF_SERVICE",
  "RETIRED",
];

export default function AssetsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [data, setData] = useState<Paginated<Asset> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const isAdmin = user?.role === "ADMIN";

  function toggle(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function printLabels() {
    const ids = Array.from(selected).join(",");
    router.push(`/print/assets?ids=${ids}`);
  }

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    try {
      const res = await api<Paginated<Asset>>(`/assets?${params.toString()}`);
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-6">
      <Reveal className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--color-text)]">
            Assets
          </h1>
          <p className="mt-1.5 text-sm text-[var(--color-text-subtle)]">
            {data ? `${data.meta.total} total` : "Loading…"}
          </p>
        </div>
        {user?.role === "ADMIN" && (
          <LinkButton href="/assets/new">
            <IconPlus className="h-4 w-4" />
            New Asset
          </LinkButton>
        )}
      </Reveal>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-56">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-subtle)]" />
          <Input
            placeholder="Search by name, code, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search assets"
          />
        </div>
        <SelectMenu
          value={status}
          onChange={setStatus}
          ariaLabel="Filter by status"
          className="w-52"
          options={[
            { value: "", label: "All statuses" },
            ...STATUS_OPTIONS.map((s) => ({
              value: s,
              label: assetStatusMeta[s].label,
            })),
          ]}
        />
      </div>

      {loading && !data ? (
        <Skeleton className="h-80" />
      ) : data && data.data.length === 0 ? (
        <EmptyState
          title="No assets found"
          description="Try adjusting your search, or register a new asset."
        />
      ) : (
        <Reveal>
        {isAdmin && selected.size > 0 && (
          <div className="mb-3 flex items-center justify-between rounded-xl border border-[var(--color-primary)] bg-[var(--color-primary-soft)] px-4 py-2.5">
            <span className="text-sm font-medium text-[var(--color-primary)]">
              {selected.size} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelected(new Set())}
                className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:bg-white/50"
              >
                Clear
              </button>
              <button
                onClick={printLabels}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
              >
                <IconQr className="h-4 w-4" />
                Print QR labels
              </button>
            </div>
          </div>
        )}
        <Card glass className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
                <tr>
                  {isAdmin && <th className="w-10 px-4 py-3" />}
                  <th className="px-4 py-3 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Next Service</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {data?.data.map((asset, i) => (
                  <motion.tr
                    key={asset.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.25 }}
                    onClick={() => router.push(`/assets/${asset.id}`)}
                    className="cursor-pointer border-l-2 border-l-transparent transition-colors hover:border-l-[var(--color-primary)] hover:bg-[var(--color-surface-muted)]"
                  >
                    {isAdmin && (
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(asset.id)}
                          onChange={() => toggle(asset.id)}
                          aria-label={`Select ${asset.code}`}
                          className="h-4 w-4 cursor-pointer accent-[var(--color-primary)]"
                        />
                      </td>
                    )}
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-[var(--color-primary)]">
                      {asset.code}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                      {asset.name}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {asset.category}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {asset.location}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={assetStatusMeta[asset.status].tone}>
                        {assetStatusMeta[asset.status].label}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[var(--color-text-muted)]">
                      {formatDateShort(asset.nextServiceDate)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        </Reveal>
      )}
    </div>
  );
}
