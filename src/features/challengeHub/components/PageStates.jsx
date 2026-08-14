// components/PageStates.jsx

import React from "react";

/**
 * Standard dark-theme page wrapper shared by ChallengeHub pages.
 * @param {{ children: React.ReactNode }} props
 */
export function PageShell({ children }) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-2xl px-6 py-10 sm:py-14">{children}</div>
    </main>
  );
}

/**
 * Standard page header: small eyebrow label, title with optional icon,
 * optional subtitle.
 * @param {{ eyebrow?: string, title: string, icon?: React.ReactNode, subtitle?: string }} props
 */
export function PageHeader({ eyebrow, title, icon, subtitle }) {
  return (
    <header>
      {eyebrow && <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{eyebrow}</p>}
      <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        {icon && <span aria-hidden="true">{icon}</span>}
        <span>{title}</span>
      </h1>
      {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
    </header>
  );
}

/**
 * Pulsing placeholder blocks shown while a page's data is loading, so
 * the page never flashes blank during navigation or a fetch.
 * @param {{ blockCount?: number, blockClassName?: string }} props
 */
export function PageSkeleton({ blockCount = 4, blockClassName = "h-20" }) {
  return (
    <PageShell>
      <div className="h-4 w-20 animate-pulse rounded-full bg-white/10" />
      <div className="mt-3 h-8 w-56 animate-pulse rounded-lg bg-white/10" />
      <div className="mt-8 space-y-4">
        {Array.from({ length: blockCount }).map((_, i) => (
          <div key={i} className={`animate-pulse rounded-2xl bg-white/5 ${blockClassName}`} />
        ))}
      </div>
    </PageShell>
  );
}

/**
 * Shown when a page's data request fails, with an optional retry action.
 * Distinct from PageEmpty — this is an exceptional state, not an expected one.
 * @param {{ title?: string, message?: string, onRetry?: () => void }} props
 */
export function PageError({
  title = "Something went wrong",
  message = "Check your connection and try again.",
  onRetry,
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-sm text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Error</p>
        <h1 className="mt-2 text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            Try again
          </button>
        )}
      </div>
    </main>
  );
}

/**
 * Shown when a page's data legitimately has nothing to display (as
 * opposed to failing to load it).
 * @param {{ title: string, message?: string }} props
 */
export function PageEmpty({ title, message }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-sm text-center">
        <h1 className="text-xl font-semibold">{title}</h1>
        {message && <p className="mt-2 text-sm leading-relaxed text-slate-400">{message}</p>}
      </div>
    </main>
  );
}