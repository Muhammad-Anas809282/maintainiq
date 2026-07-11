"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "primary";

const toneClasses: Record<Tone, string> = {
  success: "bg-[--color-success-soft] text-[--color-success]",
  warning: "bg-[--color-warning-soft] text-[--color-warning]",
  danger: "bg-[--color-danger-soft] text-[--color-danger]",
  info: "bg-[--color-info-soft] text-[--color-info]",
  neutral: "bg-[--color-neutral-soft] text-[--color-text-muted]",
  primary: "bg-[--color-primary-soft] text-[--color-primary]",
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
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  const base =
    "rounded-[--radius-card] border border-[--color-border] bg-[--color-surface] shadow-[--shadow-card]";
  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className={`${base} transition-shadow duration-200 hover:shadow-[--shadow-lift] ${className}`}
      >
        {children}
      </motion.div>
    );
  }
  return <div className={`${base} ${className}`}>{children}</div>;
}

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[--color-primary] text-[--color-primary-contrast] hover:bg-[--color-primary-hover] shadow-[0_6px_18px_-6px_rgb(79_70_229/0.5)]",
  secondary:
    "bg-[--color-surface] text-[--color-text] border border-[--color-border-strong] hover:bg-[--color-surface-muted]",
  danger: "bg-[--color-danger] text-white hover:opacity-90",
  ghost: "text-[--color-text-muted] hover:bg-[--color-surface-muted]",
};

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
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${buttonVariants[variant]} ${className}`}
    >
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
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors duration-200 ${buttonVariants[variant]} ${className}`}
    >
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
        className="block text-sm font-medium text-[--color-text]"
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-[--color-text-subtle]">{hint}</p>}
    </div>
  );
}

const inputBase =
  "w-full rounded-lg border border-[--color-border-strong] bg-[--color-surface] px-3.5 py-2.5 text-sm text-[--color-text] placeholder:text-[--color-text-subtle] focus:border-[--color-primary] focus:outline-none focus:ring-4 focus:ring-[--color-primary-soft] transition-colors";

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
    <select
      {...props}
      className={`${inputBase} cursor-pointer ${props.className ?? ""}`}
    />
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
    danger: "bg-[--color-danger-soft] text-[--color-danger]",
    success: "bg-[--color-success-soft] text-[--color-success]",
    info: "bg-[--color-info-soft] text-[--color-info]",
    warning: "bg-[--color-warning-soft] text-[--color-warning]",
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
    <div className="flex flex-col items-center justify-center rounded-[--radius-card] border border-dashed border-[--color-border-strong] bg-[--color-surface] px-6 py-16 text-center">
      <h3 className="text-base font-semibold text-[--color-text]">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-[--color-text-subtle]">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
