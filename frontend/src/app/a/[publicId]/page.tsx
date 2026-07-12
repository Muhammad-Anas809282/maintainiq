"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type {
  PublicAsset,
  TriageResult,
  IssuePriority,
  Issue,
} from "@/lib/types";
import {
  Card,
  Badge,
  Button,
  Field,
  Input,
  Textarea,
  Alert,
  Spinner,
} from "@/components/ui";
import { SelectMenu } from "@/components/select-menu";
import Image from "next/image";
import { Reveal, motion } from "@/components/motion";
import { AnimatePresence } from "motion/react";
import { IconSparkles, IconCheck } from "@/components/icons";
import {
  assetStatusMeta,
  historyLabel,
  formatDateShort,
} from "@/lib/labels";

const PRIORITIES: IssuePriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function PublicAssetPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const [asset, setAsset] = useState<PublicAsset | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [submitted, setSubmitted] = useState<Issue | null>(null);

  const load = useCallback(async () => {
    try {
      setAsset(
        await api<PublicAsset>(`/public/assets/${publicId}`, { auth: false }),
      );
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) setNotFound(true);
    }
  }, [publicId]);

  useEffect(() => {
    load();
  }, [load]);

  if (notFound)
    return (
      <Shell>
        <Card glass className="p-8 text-center">
          <h1 className="font-display text-lg font-semibold text-[var(--color-text)]">
            Asset not found
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-subtle)]">
            This QR code does not match any registered asset.
          </p>
        </Card>
      </Shell>
    );

  if (!asset)
    return (
      <Shell>
        <div className="flex justify-center py-20 text-[var(--color-text-subtle)]">
          <Spinner />
        </div>
      </Shell>
    );

  const meta = assetStatusMeta[asset.status];

  if (submitted)
    return (
      <Shell>
        <Card glass className="p-8 text-center">
          <motion.div
            initial={{ scale: 0.5, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)]"
          >
            <IconCheck className="h-6 w-6" />
          </motion.div>
          <h1 className="mt-4 font-display text-lg font-semibold text-[var(--color-text)]">
            Issue reported
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-subtle)]">
            Your reference number is{" "}
            <span className="font-mono font-semibold text-[var(--color-text)]">
              {submitted.number}
            </span>
            . The maintenance team has been notified.
          </p>
          <Button
            variant="secondary"
            className="mt-6"
            onClick={() => {
              setSubmitted(null);
              setReporting(false);
              load();
            }}
          >
            Done
          </Button>
        </Card>
      </Shell>
    );

  return (
    <Shell>
      <Reveal direction="scale">
      <Card glass className="overflow-hidden !rounded-[var(--radius-editorial)]">
        <div
          className="grain relative overflow-hidden px-5 py-5"
          style={{ background: "var(--gradient-editorial-hero)" }}
        >
          <div className="relative flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs font-semibold text-[var(--color-gold)]">
                {asset.code}
              </p>
              <h1 className="mt-0.5 font-display text-xl font-bold text-white">
                {asset.name}
              </h1>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
            >
              <Badge tone={meta.tone}>{meta.label}</Badge>
            </motion.div>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 px-5 py-4 text-sm">
          <Detail label="Category" value={asset.category} />
          <Detail label="Location" value={asset.location} />
          <Detail label="Condition" value={asset.condition ?? "—"} />
          <Detail
            label="Next service"
            value={formatDateShort(asset.nextServiceDate)}
          />
        </dl>
      </Card>
      </Reveal>

      {asset.isRetired && (
        <Alert tone="warning">
          This asset is retired and no longer accepts new issue reports.
        </Alert>
      )}

      {asset.recentActivity.length > 0 && (
        <Reveal delay={0.08} direction="left">
        <Card glass className="p-5">
          <h2 className="font-display text-sm font-semibold text-[var(--color-text)]">
            Recent activity
          </h2>
          <ul className="mt-3 space-y-2">
            {asset.recentActivity.map((a, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-[var(--color-text-muted)]">
                  {historyLabel(a.action)}
                </span>
                <span className="text-xs text-[var(--color-text-subtle)]">
                  {formatDateShort(a.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        </Reveal>
      )}

      {asset.canReportIssue && (
        <AnimatePresence mode="wait">
          {reporting ? (
            <motion.div
              key="flow"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <ReportFlow
                publicId={publicId}
                onSubmitted={setSubmitted}
                onCancel={() => setReporting(false)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Button className="w-full" onClick={() => setReporting(true)}>
                Report an issue
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </Shell>
  );
}

function ReportFlow({
  publicId,
  onSubmitted,
  onCancel,
}: {
  publicId: string;
  onSubmitted: (issue: Issue) => void;
  onCancel: () => void;
}) {
  const [complaint, setComplaint] = useState("");
  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [triaging, setTriaging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable issue fields (prefilled from triage, reporter can change).
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<IssuePriority>("MEDIUM");
  const [reporterName, setReporterName] = useState("");
  const [edited, setEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function runTriage() {
    setError(null);
    setTriaging(true);
    try {
      const result = await api<TriageResult>(
        `/public/assets/${publicId}/triage`,
        { method: "POST", body: { complaint }, auth: false },
      );
      setTriage(result);
      setTitle(result.title);
      setCategory(result.category);
      setPriority(result.priority);
      setEdited(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "AI triage unavailable");
    } finally {
      setTriaging(false);
    }
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const issue = await api<Issue>(`/public/assets/${publicId}/issues`, {
        method: "POST",
        auth: false,
        body: {
          title: title || complaint.slice(0, 80),
          description: complaint,
          category: category || undefined,
          priority,
          reporterName: reporterName || undefined,
          aiSuggested: triage ?? undefined,
          aiEdited: edited,
        },
      });
      onSubmitted(issue);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card glass className="space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-[var(--color-text)]">
          Report an issue
        </h2>
        <button
          onClick={onCancel}
          className="text-sm text-[var(--color-text-subtle)] hover:text-[var(--color-text)] cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {error && <Alert>{error}</Alert>}

      <Field
        label="Describe the problem"
        htmlFor="complaint"
        hint="Plain language is fine — AI will structure it for you."
      >
        <Textarea
          id="complaint"
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          placeholder="e.g. The projector display is flickering and sometimes does not detect HDMI"
        />
      </Field>

      {!triage ? (
        <div className="flex gap-2">
          <Button
            onClick={runTriage}
            loading={triaging}
            disabled={complaint.trim().length < 5}
          >
            <IconSparkles className="h-4 w-4" />
            AI Triage
          </Button>
          <Button
            variant="secondary"
            onClick={submit}
            loading={submitting}
            disabled={complaint.trim().length < 5}
          >
            Skip &amp; submit
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4 rounded-xl border border-[var(--color-primary-soft)] bg-[var(--color-primary-soft)]/40 p-4"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]">
              <IconSparkles className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="font-display text-sm font-semibold text-[var(--color-text)]">
              AI suggestions
            </span>
            <Badge tone={triage.source === "ai" ? "primary" : "neutral"}>
              {triage.source === "ai" ? "AI" : "Fallback"}
            </Badge>
          </div>
          <p className="text-xs text-[var(--color-text-subtle)]">
            Review and edit before submitting.
          </p>

          <Field label="Title" htmlFor="title">
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setEdited(true);
              }}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category" htmlFor="cat">
              <Input
                id="cat"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setEdited(true);
                }}
              />
            </Field>
            <Field label="Priority" htmlFor="prio">
              <SelectMenu
                id="prio"
                value={priority}
                onChange={(v) => {
                  setPriority(v as IssuePriority);
                  setEdited(true);
                }}
                ariaLabel="Priority"
                options={PRIORITIES.map((p) => ({ value: p, label: p }))}
              />
            </Field>
          </div>

          {triage.possibleCauses.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--color-text-subtle)]">
                Possible causes
              </p>
              <ul className="mt-1 list-inside list-disc text-sm text-[var(--color-text-muted)]">
                {triage.possibleCauses.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          {triage.initialChecks.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--color-text-subtle)]">
                Safe initial checks
              </p>
              <ul className="mt-1 list-inside list-disc text-sm text-[var(--color-text-muted)]">
                {triage.initialChecks.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          {triage.recurringWarning && (
            <Alert tone="warning">{triage.recurringWarning}</Alert>
          )}

          <Field label="Your name" htmlFor="name" hint="Optional">
            <Input
              id="name"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="e.g. Ali Khan"
            />
          </Field>

          <Button className="w-full" onClick={submit} loading={submitting}>
            Submit issue
          </Button>
        </motion.div>
      )}
    </Card>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen px-4 py-6"
      style={{ background: "var(--gradient-app)" }}
    >
      <div className="mx-auto w-full max-w-md space-y-4">
        <div className="flex items-center justify-center py-2">
          <Image
            src="/logo.png"
            alt="MaintainIQ"
            width={865}
            height={289}
            priority
            className="h-8 w-auto select-none"
          />
        </div>
        {children}
        <p className="pt-4 text-center text-xs text-[var(--color-text-subtle)]">
          Powered by MaintainIQ · AI-assisted maintenance
        </p>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium text-[var(--color-text)]">{value}</dd>
    </div>
  );
}
