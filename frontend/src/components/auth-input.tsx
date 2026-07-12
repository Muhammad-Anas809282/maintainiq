"use client";

import { useId, useState, type ComponentType, type InputHTMLAttributes } from "react";
import { motion, useReducedMotion } from "motion/react";
import { IconEye, IconEyeOff } from "@/components/icons";

interface PillInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  icon: ComponentType<{ className?: string }>;
  label: string;
  type?: "text" | "email" | "password";
}

/** Premium pill-shaped, icon-prefixed input with animated focus glow. */
export function PillInput({ icon: Icon, label, type = "text", ...props }: PillInputProps) {
  const reduce = useReducedMotion();
  const id = useId();
  const inputId = props.id ?? id;
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <motion.div
        animate={
          reduce
            ? undefined
            : {
                boxShadow: focused
                  ? "0 0 0 3.5px rgb(37 99 235 / 0.10)"
                  : "0 0 0 0px rgb(37 99 235 / 0)",
              }
        }
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={`flex items-center gap-3 rounded-xl border bg-[var(--color-surface)] px-4 py-3 transition-colors duration-200 ${
          focused ? "border-[var(--color-primary)]" : "border-[var(--color-border-strong)]"
        }`}
      >
        <Icon
          className={`h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${
            focused ? "text-[var(--color-primary)]" : "text-[var(--color-text-subtle)]"
          }`}
        />
        <input
          {...props}
          id={inputId}
          type={inputType}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          className="w-full min-w-0 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none"
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="shrink-0 cursor-pointer text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-text)]"
          >
            {show ? (
              <IconEyeOff className="h-[18px] w-[18px]" />
            ) : (
              <IconEye className="h-[18px] w-[18px]" />
            )}
          </button>
        )}
      </motion.div>
    </div>
  );
}
