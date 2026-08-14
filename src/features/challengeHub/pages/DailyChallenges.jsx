// pages/DailyChallenges.jsx

import React from "react";
import DailyChallenge from "../components/DailyChallenge";

/**
 * Used only when the page is rendered without a `challenges` prop, so the
 * page still renders something sensible standalone (e.g. in isolation, in
 * Storybook, or before data-fetching is wired up at the call site).
 */
const FALLBACK_CHALLENGE = {
  id: 1,
  title: "Daily Quiz",
  description: "Answer 5 questions",
  category: "PLAY",
  subCategory: "QUIZZES",
};

/**
 * @typedef {object} Challenge
 * @property {string|number} id
 * @property {string} title
 * @property {string} [description]
 * @property {string} category
 * @property {string} [subCategory]
 */

/**
 * Loading skeleton so the page doesn't flash blank while challenges load.
 * @param {{ count?: number }} props
 */
function DailyChallengesSkeleton({ count = 3 }) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-2xl px-6 py-10 sm:py-14">
        <div className="h-4 w-20 animate-pulse rounded-full bg-white/10" />
        <div className="mt-3 h-8 w-56 animate-pulse rounded-lg bg-white/10" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    </main>
  );
}

/**
 * Shown when the challenges request fails, with a way to retry instead of
 * a dead end.
 * @param {{ onRetry?: () => void }} props
 */
function DailyChallengesError({ onRetry }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-sm text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Something went wrong</p>
        <h1 className="mt-2 text-xl font-semibold">Couldn't load today's challenges</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">Check your connection and try again.</p>
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
 * Shown when there are genuinely no challenges today, distinct from an
 * error — this is an expected, not exceptional, state.
 */
function DailyChallengesEmpty() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-sm text-center">
        <h1 className="text-xl font-semibold">No challenges today</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">New challenges land at midnight — check back soon.</p>
      </div>
    </main>
  );
}

/**
 * Daily Challenges page: lists the challenges available today.
 *
 * @param {object} props
 * @param {Challenge[]} [props.challenges] - today's challenges. Falls back to a single placeholder when omitted, so the page still renders standalone.
 * @param {boolean} [props.isLoading=false]
 * @param {Error|string|null} [props.error=null]
 * @param {() => void} [props.onRetry] - invoked from the error state's retry button.
 */
export default function DailyChallenges({ challenges, isLoading = false, error = null, onRetry }) {
  if (isLoading) return <DailyChallengesSkeleton />;
  if (error) return <DailyChallengesError onRetry={onRetry} />;

  const list = challenges ?? [FALLBACK_CHALLENGE];
  if (list.length === 0) return <DailyChallengesEmpty />;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-2xl px-6 py-10 sm:py-14">
        <header>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Today</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Daily Challenges</h1>
          <p className="mt-2 text-sm text-slate-400">New challenges refresh at midnight.</p>
        </header>

        <ul className="mt-8 space-y-4" aria-label="Today's challenges">
          {list.map((challenge) => (
            <li key={challenge.id}>
              <DailyChallenge challenge={challenge} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}