"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui";

interface Label {
  organization: string;
  assetName: string;
  assetCode: string;
  location: string;
  publicUrl: string;
  qrDataUrl: string;
  scanInstruction: string;
}

function PrintContent() {
  const params = useSearchParams();
  const ids = (params.get("ids") ?? "").split(",").filter(Boolean);
  const [labels, setLabels] = useState<Label[] | null>(null);

  useEffect(() => {
    if (ids.length === 0) {
      setLabels([]);
      return;
    }
    Promise.all(ids.map((id) => api<Label>(`/assets/${id}/label`)))
      .then(setLabels)
      .catch(() => setLabels([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  if (!labels)
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--color-text-subtle)]">
        <Spinner />
      </div>
    );

  return (
    <div className="min-h-screen bg-white p-8 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <div>
            <h1 className="font-display text-2xl font-bold">QR Labels</h1>
            <p className="text-sm text-slate-500">
              {labels.length} asset label(s) · print or save as PDF
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="cursor-pointer rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Print
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {labels.map((l) => (
            <div
              key={l.assetCode}
              className="flex flex-col items-center rounded-xl border border-slate-200 p-4 text-center"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {l.organization}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={l.qrDataUrl}
                alt={`QR ${l.assetCode}`}
                className="my-2 h-32 w-32"
              />
              <p className="font-bold text-slate-900">{l.assetName}</p>
              <p className="font-mono text-xs text-indigo-600">{l.assetCode}</p>
              <p className="text-xs text-slate-500">{l.location}</p>
              <p className="mt-1 text-[10px] text-slate-400">
                {l.scanInstruction}
              </p>
            </div>
          ))}
        </div>

        {labels.length === 0 && (
          <p className="py-20 text-center text-sm text-slate-500">
            No assets selected.
          </p>
        )}
      </div>
    </div>
  );
}

export default function PrintAssetsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <PrintContent />
    </Suspense>
  );
}
