"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { hoverSpring } from "@/components/motion";

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "primary";

const toneClasses: Record<Tone, string> = {
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  danger: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
  info: "bg-[var(--color-info-soft)] text-[var(--color-info)]",
  neutral: "bg-[var(--color-neutral-soft)] text-[var(--color-text-muted)]",
  primary: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClasses[tone]}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-current opacity-70"
        aria-hidden
      />
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
  hover = false,
  glass = false,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  /** "editorial" = navy/gold gradient hero surface — reserve for a handful of feature moments, not every card. */
  tone?: "default" | "glass" | "editorial";
}) {
  const resolvedTone = glass ? "glass" : tone;
  const base =
    resolvedTone === "editorial"
      ? "grain relative overflow-hidden rounded-[var(--radius-editorial)] text-white shadow-[var(--shadow-pop)]"
      : resolvedTone === "glass"
        ? "glass rounded-[var(--radius-card)]"
        : "rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]";
  const editorialBg =
    resolvedTone === "editorial" ? { background: "var(--gradient-editorial-hero)" } : undefined;

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={hoverSpring}
        style={editorialBg}
        className={`${base} transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] ${className}`}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <div style={editorialBg} className={`${base} ${className}`}>
      {children}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-primary-contrast)] hover:bg-[var(--color-primary-hover)] shadow-[0_6px_18px_-6px_rgb(143_100_37/0.5)]",
  secondary:
    "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)]",
  // Outlined, not filled — destructive weight belongs on the confirmation
  // step (the native confirm() dialog), not the trigger button itself.
  danger:
    "border bg-[var(--color-surface)] hover:bg-[var(--color-danger-soft)] disabled:opacity-60",
  ghost: "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]",
};

// Explicit inline fallback for the danger variant's border/text color — a
// belt-and-suspenders guard against any arbitrary-value CSS-var edge case,
// same pattern used to harden the auth buttons earlier in this project.
const dangerStyle = { borderColor: "#dc2626", color: "#dc2626" } as const;

export function Button({
  variant = "primary",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: {
  variant?: ButtonVariant;
  loading?: boolean;
} & ComponentProps<"button">) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      {...(props as ComponentProps<typeof motion.button>)}
      disabled={disabled || loading}
      style={variant === "danger" ? dangerStyle : undefined}
      className={`group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${buttonVariants[variant]} ${className}`}
    >
      {variant === "primary" && (
        <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
      )}
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </motion.button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors duration-200 ${buttonVariants[variant]} ${className}`}
    >
      {variant === "primary" && (
        <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
      )}
      {children}
    </Link>
  );
}

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-[var(--color-text)]"
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-[var(--color-text-subtle)]">{hint}</p>}
    </div>
  );
}

const inputBase =
  "w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-soft)] transition-colors";

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={`${inputBase} min-h-24 resize-y ${props.className ?? ""}`}
    />
  );
}

export function Select(props: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`${inputBase} cursor-pointer appearance-none pr-10 ${props.className ?? ""}`}
      />
      <svg
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-subtle)]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

export function Alert({
  tone = "danger",
  children,
}: {
  tone?: "danger" | "success" | "info" | "warning";
  children: ReactNode;
}) {
  const map = {
    danger: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
    success: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
    info: "bg-[var(--color-info-soft)] text-[var(--color-info)]",
    warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg px-4 py-3 text-sm font-medium ${map[tone]}`}
    >
      {children}
    </motion.div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-surface-muted)]">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text-subtle)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
        </svg>
      </div>
      <h3 className="font-display text-base font-semibold text-[var(--color-text)]">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-[var(--color-text-subtle)]">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
