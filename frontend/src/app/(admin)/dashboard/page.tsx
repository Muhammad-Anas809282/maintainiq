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
import { DonutChart, BarChart, type Segment } from "@/components/charts";
import {
  assetStatusMeta,
  issueStatusMeta,
  priorityMeta,
  formatDate,
} from "@/lib/labels";

function StatCard({
  label,
  value,
  accent,
  hint,
}: {
  label: string;
  value: number;
  accent?: string;
  hint?: string;
}) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
      <Card hover className="p-5">
        <p className="text-sm font-medium text-[--color-text-subtle]">{label}</p>
        <p
          className="mt-2 font-display text-4xl font-bold tracking-tight"
          style={{ color: accent ?? "var(--color-text)" }}
        >
          <AnimatedNumber value={value} />
        </p>
        {hint && (
          <p className="mt-1 text-xs text-[--color-text-subtle]">{hint}</p>
        )}
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
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
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

  return (
    <div className="space-y-8">
      <Reveal>
        <h1 className="font-display text-3xl font-bold tracking-tight text-[--color-text]">
          Dashboard
        </h1>
        <p className="mt-1.5 text-sm text-[--color-text-subtle]">
          Operational overview of assets and maintenance issues.
        </p>
      </Reveal>

      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Assets" value={data.assets.total} />
        <StatCard label="Open Issues" value={data.issues.open} />
        <StatCard
          label="Critical Open"
          value={data.issues.criticalOpen}
          accent={data.issues.criticalOpen > 0 ? "var(--color-danger)" : undefined}
        />
        <StatCard
          label="Service Due"
          value={data.assets.dueService}
          accent={data.assets.dueService > 0 ? "var(--color-warning)" : undefined}
        />
      </Stagger>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <Card className="p-6">
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
          <Card className="p-6">
            <h2 className="font-display text-base font-semibold text-[--color-text]">
              Issues by priority
            </h2>
            <div className="mt-6">
              <BarChart segments={prioritySegments} />
            </div>
          </Card>
        </Reveal>
      </div>

      <Reveal>
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[--color-border] px-6 py-4">
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
            <ul className="divide-y divide-[--color-border]">
              {data.recentIssues.map((issue, i) => (
                <motion.li
                  key={issue.number}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                >
                  <div className="flex items-center justify-between gap-4 px-6 py-4">
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
