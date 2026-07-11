"use client";

import { useState } from "react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 23 23">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M12 1h10v10H12z" />
      <path fill="#00A4EF" d="M1 12h10v10H1z" />
      <path fill="#FFB900" d="M12 12h10v10H12z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0b1220">
      <path d="M12 1.27a11 11 0 0 0-3.48 21.46c.55.09.73-.24.73-.53v-1.85c-3.03.66-3.67-1.46-3.67-1.46-.5-1.26-1.21-1.6-1.21-1.6-.99-.67.07-.66.07-.66 1.1.08 1.67 1.13 1.67 1.13.97 1.67 2.55 1.19 3.17.91.1-.71.38-1.19.69-1.46-2.42-.28-4.96-1.21-4.96-5.38 0-1.19.42-2.16 1.13-2.92-.11-.28-.49-1.39.11-2.9 0 0 .92-.3 3.02 1.11a10.4 10.4 0 0 1 5.5 0c2.1-1.41 3.02-1.11 3.02-1.11.6 1.51.22 2.62.11 2.9.7.76 1.12 1.73 1.12 2.92 0 4.18-2.54 5.1-4.97 5.37.39.34.74 1 .74 2.03v3.01c0 .29.19.63.74.52A11 11 0 0 0 12 1.27z" />
    </svg>
  );
}

export function SocialButtons() {
  const [note, setNote] = useState(false);
  const providers = [
    { name: "Google", icon: <GoogleIcon /> },
    { name: "Microsoft", icon: <MicrosoftIcon /> },
    { name: "GitHub", icon: <GithubIcon /> },
  ];

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[--color-border]" />
        <span className="text-xs text-[--color-text-subtle]">
          or continue with
        </span>
        <span className="h-px flex-1 bg-[--color-border]" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {providers.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => setNote(true)}
            aria-label={`Continue with ${p.name}`}
            className="flex cursor-pointer items-center justify-center rounded-lg border border-[--color-border-strong] bg-[--color-surface] py-2.5 transition-colors hover:bg-[--color-surface-muted]"
          >
            {p.icon}
          </button>
        ))}
      </div>
      {note && (
        <p className="mt-3 text-center text-xs text-[--color-text-subtle]">
          Social sign-in is coming soon — please use email for now.
        </p>
      )}
    </div>
  );
}
