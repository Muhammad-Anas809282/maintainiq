"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type {
  DashboardSummary,
  AssetStatus,
  IssueStatus,
  IssuePriority,
} from "@/lib/types";
import { Card, Badge, Skeleton } from "@/components/ui";
import { Reveal, Stagger, AnimatedNumber, motion } from "@/components/motion";
import {
  DonutChart,
  BarChart,
  GaugeChart,
  AreaChart,
  CATEGORY_TONES,
  type Segment,
} from "@/components/charts";
import {
  assetStatusMeta,
  issueStatusMeta,
  priorityMeta,
  formatDate,
} from "@/lib/labels";

function StatTile({
  label,
  value,
  accent,
  suffix,
}: {
  label: string;
  value: number;
  accent?: string;
  suffix?: string;
}) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
    >
      <Card glass hover className="p-5">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: accent ?? "var(--color-primary)" }}
          />
          <p className="text-xs font-semibold uppercase tracking-wide text-[--color-text-subtle]">
            {label}
          </p>
        </div>
        <p
          className="mt-2 font-display text-4xl font-bold tracking-tight"
          style={{ color: accent ?? "var(--color-text)" }}
        >
          <AnimatedNumber value={value} />
          {suffix && (
            <span className="ml-1 text-lg text-[--color-text-subtle]">
              {suffix}
            </span>
          )}
        </p>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<DashboardSummary>("/dashboard/summary")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error)
    return (
      <p className="text-sm text-[--color-danger]">Failed to load: {error}</p>
    );

  if (!data)
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );

  const assetSegments: Segment[] = Object.entries(data.assets.byStatus).map(
    ([status, value]) => ({
      label: assetStatusMeta[status as AssetStatus]?.label ?? status,
      value,
      tone: assetStatusMeta[status as AssetStatus]?.tone ?? "neutral",
    }),
  );

  const prioritySegments: Segment[] = (
    ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as IssuePriority[]
  )
    .filter((p) => data.issues.byPriority[p])
    .map((p) => ({
      label: priorityMeta[p].label,
      value: data.issues.byPriority[p],
      tone: priorityMeta[p].tone,
    }));

  const categorySegments: Segment[] = Object.entries(data.assets.byCategory).map(
    ([label, value], i) => ({
      label,
      value,
      tone: CATEGORY_TONES[i % CATEGORY_TONES.length],
    }),
  );

  const trendTotal = data.trends.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-6">
      <Reveal className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[--color-text]">
            Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-[--color-text-subtle]">
            Operational overview of assets and maintenance issues.
          </p>
        </div>
        <Badge tone="success">Live</Badge>
      </Reveal>

      {/* KPI tiles */}
      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Total Assets"
          value={data.assets.total}
          accent="var(--color-primary)"
        />
        <StatTile
          label="Open Issues"
          value={data.issues.open}
          accent="var(--color-accent-2)"
        />
        <StatTile
          label="Critical Open"
          value={data.issues.criticalOpen}
          accent={data.issues.criticalOpen > 0 ? "var(--color-danger)" : "var(--color-neutral)"}
        />
        <StatTile
          label="Avg Resolution"
          value={data.rates.avgResolutionHours}
          accent="var(--color-accent-3)"
          suffix="h"
        />
      </Stagger>

      {/* Trend + dark highlight card */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card glass className="h-full p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-[--color-text]">
                Issues reported
              </h2>
              <span className="text-xs font-medium text-[--color-text-subtle]">
                Last 14 days · {trendTotal} total
              </span>
            </div>
            <div className="mt-4">
              <AreaChart data={data.trends} tone="primary" />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-[--color-text-subtle]">
              <span>{formatDayLabel(data.trends[0]?.date)}</span>
              <span>
                {formatDayLabel(data.trends[data.trends.length - 1]?.date)}
              </span>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.05}>
          <div
            className="relative flex h-full flex-col justify-between overflow-hidden rounded-[--radius-card] p-6 text-white"
            style={{ background: "var(--gradient-dark-card)" }}
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                Operational rate
              </p>
              <p className="mt-2 font-display text-5xl font-bold">
                <AnimatedNumber value={data.rates.operationalRate} />
                <span className="text-2xl text-white/70">%</span>
              </p>
            </div>
            <div className="relative mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/60">Resolution</p>
                <p className="font-display text-xl font-bold">
                  {data.rates.resolutionRate}%
                </p>
              </div>
              <div>
                <p className="text-xs text-white/60">Service due</p>
                <p className="font-display text-xl font-bold">
                  {data.assets.dueService}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Distribution row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal>
          <Card glass className="h-full p-6">
            <h2 className="font-display text-base font-semibold text-[--color-text]">
              Assets by status
            </h2>
            <div className="mt-6">
              <DonutChart
                segments={assetSegments}
                total={data.assets.total}
                centerLabel="Assets"
              />
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.05}>
          <Card glass className="flex h-full flex-wrap items-center justify-around gap-4 p-6">
            <GaugeChart
              value={data.rates.operationalRate}
              label="Operational"
              tone="success"
            />
            <GaugeChart
              value={data.rates.resolutionRate}
              label="Resolution"
              tone="primary"
            />
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card glass className="h-full p-6">
            <h2 className="font-display text-base font-semibold text-[--color-text]">
              Issues by priority
            </h2>
            <div className="mt-6">
              <BarChart segments={prioritySegments} />
            </div>
          </Card>
        </Reveal>
      </div>

      {/* Category + attention */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <Card glass className="h-full p-6">
            <h2 className="font-display text-base font-semibold text-[--color-text]">
              Assets by category
            </h2>
            <div className="mt-6">
              <BarChart segments={categorySegments} />
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.05}>
          <Card glass className="overflow-hidden">
            <div className="border-b border-white/50 px-6 py-4">
              <h2 className="font-display text-base font-semibold text-[--color-text]">
                Needs attention
              </h2>
            </div>
            {data.attentionAssets.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-[--color-text-subtle]">
                All assets operational.
              </p>
            ) : (
              <ul className="divide-y divide-white/50">
                {data.attentionAssets.map((a, i) => (
                  <motion.li
                    key={a.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.3 }}
                  >
                    <Link
                      href={`/assets/${a.id}`}
                      className="flex items-center justify-between gap-3 px-6 py-3 transition-colors hover:bg-white/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[--color-text]">
                          {a.name}
                        </p>
                        <p className="text-xs text-[--color-text-subtle]">
                          {a.code} · {a.location}
                        </p>
                      </div>
                      <Badge tone={assetStatusMeta[a.status].tone}>
                        {assetStatusMeta[a.status].label}
                      </Badge>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            )}
          </Card>
        </Reveal>
      </div>

      {/* Recent issues */}
      <Reveal>
        <Card glass className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/50 px-6 py-4">
            <h2 className="font-display text-base font-semibold text-[--color-text]">
              Recent issues
            </h2>
            <Link
              href="/issues"
              className="text-sm font-medium text-[--color-primary] hover:underline"
            >
              View all
            </Link>
          </div>
          {data.recentIssues.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-[--color-text-subtle]">
              No issues reported yet.
            </p>
          ) : (
            <ul className="divide-y divide-white/50">
              {data.recentIssues.map((issue, i) => (
                <motion.li
                  key={issue.number}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                >
                  <div className="flex cursor-default items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-white/40">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[--color-text]">
                        {issue.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[--color-text-subtle]">
                        {issue.number} · {issue.asset.code} — {issue.asset.name} ·{" "}
                        {formatDate(issue.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge tone={priorityMeta[issue.priority].tone}>
                        {priorityMeta[issue.priority].label}
                      </Badge>
                      <Badge tone={issueStatusMeta[issue.status as IssueStatus]?.tone}>
                        {issueStatusMeta[issue.status as IssueStatus]?.label}
                      </Badge>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </Card>
      </Reveal>
    </div>
  );
}

function formatDayLabel(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
