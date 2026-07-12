"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const TONE_COLOR: Record<string, string> = {
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
  info: "#0284c7",
  primary: "#4f46e5",
  neutral: "#94a3b8",
  accent: "#7c3aed",
  sky: "#0ea5e9",
  teal: "#14b8a6",
  violet: "#8b5cf6",
  rose: "#f43f5e",
};

// Rotating palette for categorical charts (professional, varied).
export const CATEGORY_TONES: (keyof typeof TONE_COLOR)[] = [
  "primary",
  "sky",
  "teal",
  "violet",
  "warning",
  "rose",
];

export interface Segment {
  label: string;
  value: number;
  tone: keyof typeof TONE_COLOR;
}

/** Animated donut chart with a centered total. */
export function DonutChart({
  segments,
  total,
  centerLabel = "Total",
}: {
  segments: Segment[];
  total: number;
  centerLabel?: string;
}) {
  const reduce = useReducedMotion();
  const size = 168;
  const stroke = 20;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const sum = segments.reduce((s, x) => s + x.value, 0) || 1;

  let offset = 0;
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const frac = s.value / sum;
      const dash = frac * c;
      const arc = { ...s, dash, gap: c - dash, rot: (offset / sum) * 360 };
      offset += s.value;
      return arc;
    });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-surface-muted)"
            strokeWidth={stroke}
          />
          {arcs.map((a, i) => (
            <motion.circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={TONE_COLOR[a.tone]}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${a.dash} ${a.gap}`}
              transform={`rotate(${a.rot} ${size / 2} ${size / 2})`}
              initial={reduce ? false : { strokeDasharray: `0 ${c}` }}
              whileInView={reduce ? undefined : { strokeDasharray: `${a.dash} ${a.gap}` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              className="cursor-pointer transition-[stroke-width] hover:[stroke-width:24]"
            >
              <title>{`${a.label}: ${a.value}`}</title>
            </motion.circle>
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold text-[--color-text]">
            {total}
          </span>
          <span className="text-xs text-[--color-text-subtle]">{centerLabel}</span>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 truncate text-[--color-text-muted]">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: TONE_COLOR[s.tone] }}
              />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="font-semibold text-[--color-text]">{s.value}</span>
          </li>
        ))}
        {segments.length === 0 && (
          <li className="text-sm text-[--color-text-subtle]">No data yet.</li>
        )}
      </ul>
    </div>
  );
}

/** Tiny sparkline for KPI cards. */
export function Sparkline({
  data,
  tone = "primary",
}: {
  data: number[];
  tone?: keyof typeof TONE_COLOR;
}) {
  const reduce = useReducedMotion();
  const w = 100;
  const h = 32;
  const max = Math.max(1, ...data);
  const stepX = data.length > 1 ? w / (data.length - 1) : 0;
  const pts = data.map((v, i) => [i * stepX, h - (v / max) * (h - 4) - 2] as const);
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const color = TONE_COLOR[tone];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" preserveAspectRatio="none">
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        whileInView={reduce ? undefined : { pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

/** Animated radial gauge (0–100), e.g. a quality/operational score. */
export function GaugeChart({
  value,
  label,
  tone = "primary",
  suffix = "%",
}: {
  value: number;
  label: string;
  tone?: keyof typeof TONE_COLOR;
  suffix?: string;
}) {
  const reduce = useReducedMotion();
  const size = 132;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value)) / 100;
  const dash = pct * c;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-surface-muted)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={TONE_COLOR[tone]}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            initial={reduce ? false : { strokeDasharray: `0 ${c}` }}
            whileInView={reduce ? undefined : { strokeDasharray: `${dash} ${c - dash}` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold text-[--color-text]">
            {value}
            <span className="text-base text-[--color-text-subtle]">{suffix}</span>
          </span>
        </div>
      </div>
      <p className="mt-2 text-center text-xs font-medium text-[--color-text-subtle]">
        {label}
      </p>
    </div>
  );
}

/** Animated, interactive area/line trend chart with a hover tooltip. */
export function AreaChart({
  data,
  tone = "primary",
}: {
  data: { date: string; count: number }[];
  tone?: keyof typeof TONE_COLOR;
}) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const w = 520;
  const h = 160;
  const pad = 8;
  const max = Math.max(1, ...data.map((d) => d.count));
  const stepX = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
  const color = TONE_COLOR[tone];

  const pts = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = h - pad - (d.count / max) * (h - pad * 2);
    return [x, y] as const;
  });

  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${pts[pts.length - 1]?.[0] ?? pad},${h - pad} L${pad},${h - pad} Z`;

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * w;
    const idx = Math.round((x - pad) / (stepX || 1));
    setHover(Math.max(0, Math.min(data.length - 1, idx)));
  }

  const hp = hover !== null ? pts[hover] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-40 w-full"
        preserveAspectRatio="none"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`area-${tone}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill={`url(#area-${tone})`}
          initial={reduce ? false : { opacity: 0 }}
          whileInView={reduce ? undefined : { opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={reduce ? undefined : { pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
        {hp && (
          <>
            <line x1={hp[0]} y1={pad} x2={hp[0]} y2={h - pad} stroke={color} strokeOpacity="0.3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx={hp[0]} cy={hp[1]} r="4" fill={color} stroke="#fff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>
      {hover !== null && data[hover] && (
        <div
          className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-[--color-text] px-2.5 py-1.5 text-center shadow-lg"
          style={{ left: `${((pts[hover][0] - pad) / (w - pad * 2)) * 100}%` }}
        >
          <p className="text-xs font-bold text-[--color-surface]">
            {data[hover].count} issue{data[hover].count === 1 ? "" : "s"}
          </p>
          <p className="text-[10px] text-[--color-surface] opacity-70">
            {new Date(data[hover].date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      )}
    </div>
  );
}

/** Animated horizontal bar chart. */
export function BarChart({ segments }: { segments: Segment[] }) {
  const reduce = useReducedMotion();
  const max = Math.max(1, ...segments.map((s) => s.value));

  if (segments.length === 0)
    return <p className="text-sm text-[--color-text-subtle]">No data yet.</p>;

  return (
    <div className="space-y-3">
      {segments.map((s, i) => (
        <div key={s.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[--color-text-muted]">{s.label}</span>
            <span className="font-semibold text-[--color-text]">{s.value}</span>
          </div>
          <div
            className="h-2.5 overflow-hidden rounded-full bg-[--color-surface-muted]"
            title={`${s.label}: ${s.value}`}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: TONE_COLOR[s.tone] }}
              initial={reduce ? false : { width: 0 }}
              whileInView={reduce ? undefined : { width: `${(s.value / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
