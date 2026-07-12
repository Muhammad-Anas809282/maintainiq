"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Asset, HistoryEvent, IssueStatus } from "@/lib/types";
import {
  Card,
  Badge,
  Button,
  Spinner,
  Alert,
} from "@/components/ui";
import { Reveal, TimelineReveal } from "@/components/motion";
import {
  IconDownload,
  IconCopy,
  IconExternal,
  IconCheck,
} from "@/components/icons";
import {
  assetStatusMeta,
  issueStatusMeta,
  priorityMeta,
  historyLabel,
  formatDate,
  formatDateShort,
} from "@/lib/labels";
import { useAuth } from "@/lib/auth";

interface QrData {
  publicUrl: string;
  qrDataUrl: string;
  code: string;
  name: string;
}

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [qr, setQr] = useState<QrData | null>(null);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [a, q, h] = await Promise.all([
        api<Asset>(`/assets/${id}`),
        api<QrData>(`/assets/${id}/qr`),
        api<HistoryEvent[]>(`/assets/${id}/history`),
      ]);
      setAsset(a);
      setQr(q);
      setHistory(h);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load asset");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function retire() {
    if (!confirm("Retire this asset? It will no longer accept new issues."))
      return;
    setBusy(true);
    try {
      await api(`/assets/${id}/retire`, { method: "PATCH" });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to retire");
    } finally {
      setBusy(false);
    }
  }

  function copyLink() {
    if (!qr) return;
    navigator.clipboard.writeText(qr.publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadQr() {
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr.qrDataUrl;
    a.download = `${qr.code}-qr.png`;
    a.click();
  }

  if (error) return <Alert>{error}</Alert>;
  if (!asset || !qr)
    return (
      <div className="flex justify-center py-20 text-[var(--color-text-subtle)]">
        <Spinner />
      </div>
    );

  const meta = assetStatusMeta[asset.status];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/assets"
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          ← Back to assets
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--color-text)]">
                {asset.name}
              </h1>
              <Badge tone={meta.tone}>{meta.label}</Badge>
            </div>
            <p className="mt-1 font-mono text-sm text-[var(--color-text-subtle)]">
              {asset.code}
            </p>
          </div>
          {user?.role === "ADMIN" && asset.status !== "RETIRED" && (
            <Button variant="danger" onClick={retire} loading={busy}>
              Retire asset
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Details */}
        <div className="space-y-6 lg:col-span-2">
          <Reveal direction="left" trigger="mount">
          <Card glass className="!rounded-[var(--radius-editorial)] p-5">
            <h2 className="font-display text-sm font-semibold text-[var(--color-text)]">
              Details
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <Detail label="Category" value={asset.category} />
              <Detail label="Location" value={asset.location} />
              <Detail label="Condition" value={asset.condition ?? "—"} />
              <Detail
                label="Last service"
                value={formatDateShort(asset.lastServiceDate)}
              />
              <Detail
                label="Next service"
                value={formatDateShort(asset.nextServiceDate)}
              />
              <Detail label="Registered" value={formatDateShort(asset.createdAt)} />
            </dl>
            {asset.description && (
              <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">
                  Description
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {asset.description}
                </p>
              </div>
            )}
          </Card>
          </Reveal>

          {/* Issues */}
          <Reveal delay={0.05}>
          <Card className="overflow-hidden">
            <div className="border-b border-[var(--color-border)] px-5 py-4">
              <h2 className="font-display text-sm font-semibold text-[var(--color-text)]">
                Issues ({asset.issues?.length ?? 0})
              </h2>
            </div>
            {!asset.issues || asset.issues.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-[var(--color-text-subtle)]">
                No issues reported for this asset.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {asset.issues.map((issue) => (
                  <li key={issue.id}>
                    <Link
                      href={`/issues/${issue.id}`}
                      className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--color-surface-muted)]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--color-text)]">
                          {issue.title}
                        </p>
                        <p className="text-xs text-[var(--color-text-subtle)]">
                          {issue.number} · {formatDate(issue.createdAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge tone={priorityMeta[issue.priority].tone}>
                          {priorityMeta[issue.priority].label}
                        </Badge>
                        <Badge
                          tone={
                            issueStatusMeta[issue.status as IssueStatus]?.tone
                          }
                        >
                          {issueStatusMeta[issue.status as IssueStatus]?.label}
                        </Badge>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          </Reveal>

          {/* History */}
          <Reveal delay={0.1}>
          <Card className="overflow-hidden">
            <div className="border-b border-[var(--color-border)] px-5 py-4">
              <h2 className="font-display text-sm font-semibold text-[var(--color-text)]">
                History timeline
              </h2>
            </div>
            {history.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-[var(--color-text-subtle)]">
                No history yet.
              </p>
            ) : (
              <TimelineReveal showConnector className="px-5 py-4">
                {history.map((event, i) => (
                  <TimelineReveal.Step key={event.id} index={i} className="pb-5 last:pb-0">
                    <span className="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-surface)]" />
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      {historyLabel(event.action)}
                    </p>
                    <p className="text-xs text-[var(--color-text-subtle)]">
                      {formatDate(event.createdAt)}
                      {event.actor ? ` · ${event.actor.name}` : ""}
                    </p>
                  </TimelineReveal.Step>
                ))}
              </TimelineReveal>
            )}
          </Card>
          </Reveal>
        </div>

        {/* QR panel */}
        <Reveal direction="right" trigger="mount" className="space-y-6">
          <Card className="p-5">
            <h2 className="font-display text-sm font-semibold text-[var(--color-text)]">
              QR code
            </h2>
            <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
              Scan to open the public asset page and report issues.
            </p>
            <div className="mt-4 flex justify-center rounded-lg border border-[var(--color-border)] bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qr.qrDataUrl}
                alt={`QR code for asset ${qr.code}`}
                width={200}
                height={200}
                className="h-48 w-48"
              />
            </div>
            <div className="mt-4 space-y-2">
              <Button
                variant="secondary"
                onClick={downloadQr}
                className="w-full"
              >
                <IconDownload className="h-4 w-4" />
                Download QR
              </Button>
              <Button variant="secondary" onClick={copyLink} className="w-full">
                {copied ? (
                  <IconCheck className="h-4 w-4" />
                ) : (
                  <IconCopy className="h-4 w-4" />
                )}
                {copied ? "Copied!" : "Copy public link"}
              </Button>
              <a
                href={qr.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition-colors duration-200 hover:bg-[var(--color-surface-muted)]"
              >
                <IconExternal className="h-4 w-4" />
                Open public page
              </a>
            </div>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium text-[var(--color-text)]">{value}</dd>
    </div>
  );
}
