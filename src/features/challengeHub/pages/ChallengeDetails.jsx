// pages/ChallengeDetails.jsx

import React, { useMemo } from "react";
import { getCategoryConfig } from "../utils/categories";
import ChallengeProgress from "../components/ChallengeProgress";
import ChallengeReward from "../components/ChallengeReward";

/**
 * @typedef {object} ChallengeReward
 * @property {number} [xp]
 * @property {string} [badge]
 * @property {number} [coins]
 */

/**
 * @typedef {object} ChallengeProgressData
 * @property {number} current
 * @property {number} total
 */

/**
 * @typedef {object} Challenge
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {string} category
 * @property {string} [subCategory]
 * @property {"not_started"|"in_progress"|"completed"} [status]
 * @property {ChallengeProgressData} [progress]
 * @property {ChallengeReward} [reward]
 */

/**
 * Turns a reward object into the short label ChallengeReward expects.
 * Falls back to a generic message when no reward data is available,
 * rather than silently rendering "undefined" or an empty component.
 * @param {ChallengeReward|undefined} reward
 * @returns {string}
 */
function formatReward(reward) {
  if (!reward || (reward.xp == null && !reward.badge && reward.coins == null)) {
    return "Complete this challenge to earn rewards";
  }
  const parts = [];
  if (reward.xp != null) parts.push(`${reward.xp} XP`);
  if (reward.coins != null) parts.push(`${reward.coins} Coins`);
  if (reward.badge) parts.push(reward.badge);
  return parts.join(" + ");
}

/**
 * Skeleton shown while the challenge is being fetched, so the page never
 * flashes a blank screen during navigation.
 */
function ChallengeDetailsSkeleton() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-2xl animate-pulse px-6 py-10 sm:py-14">
        <div className="h-4 w-24 rounded-full bg-white/10" />
        <div className="mt-4 h-8 w-2/3 rounded-lg bg-white/10" />
        <div className="mt-3 h-4 w-full rounded bg-white/5" />
        <div className="mt-2 h-4 w-1/2 rounded bg-white/5" />
        <div className="mt-8 h-20 rounded-2xl bg-white/5" />
        <div className="mt-4 h-16 rounded-2xl bg-white/5" />
      </div>
    </main>
  );
}

/**
 * Empty/error state shown when no challenge could be resolved (bad id,
 * deleted challenge, failed fetch). Gives the person a way back instead
 * of a dead end.
 * @param {{ onBack?: () => void }} props
 */
function ChallengeNotFound({ onBack }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-sm text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Challenge unavailable</p>
        <h1 className="mt-2 text-xl font-semibold">We couldn't find this challenge</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          It may have been removed, or the link might be out of date.
        </p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mt-6 inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            Back to challenges
          </button>
        )}
      </div>
    </main>
  );
}

/**
 * Challenge detail page: title, description, category, progress, reward,
 * and a call-to-action to start/continue/review the challenge.
 *
 * @param {object} props
 * @param {Challenge} [props.challenge] - the challenge to display.
 * @param {boolean} [props.isLoading=false] - shows a skeleton while true.
 * @param {(challenge: Challenge) => void} [props.onStart] - invoked when the CTA is pressed.
 * @param {() => void} [props.onBack] - invoked from the not-found state's back button.
 */
export default function ChallengeDetails({ challenge, isLoading = false, onStart, onBack }) {
  const config = useMemo(() => getCategoryConfig(challenge?.category), [challenge?.category]);

  if (isLoading) return <ChallengeDetailsSkeleton />;
  if (!challenge) return <ChallengeNotFound onBack={onBack} />;

  const { title, description, subCategory, progress, reward, status } = challenge;

  const total = progress?.total ?? 0;
  const current = Math.min(progress?.current ?? 0, total || Infinity);
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  const isComplete = status === "completed" || percent >= 100;

  const ctaLabel = isComplete ? "Review challenge" : current > 0 ? "Continue challenge" : "Start challenge";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-2xl px-6 py-10 sm:py-14">
        <header>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            {config?.name ?? "Uncategorized"}
            {subCategory ? ` • ${subCategory}` : ""}
          </p>

          <h1 className="mt-3 flex items-center gap-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {config?.icon && (
              <span aria-hidden="true" className="text-3xl leading-none">
                {config.icon}
              </span>
            )}
            <span>{title}</span>
          </h1>

          {description && <p className="mt-3 leading-relaxed text-slate-300">{description}</p>}
        </header>

        <section aria-label="Your progress" className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <ChallengeProgress current={current} total={total} />
        </section>

        <section aria-label="Reward" className="mt-4">
          <ChallengeReward reward={formatReward(reward)} />
        </section>

        {onStart && (
          <button
            type="button"
            onClick={() => onStart(challenge)}
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:w-auto"
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </main>
  );
}
