// pages/Leaderboards.jsx

import React from "react";

/**
 * Used only when the page is rendered without a `leaders` prop, so it
 * still renders something sensible standalone.
 */
const FALLBACK_LEADERS = [
  { id: "alice", name: "Alice", points: 1200 },
  { id: "bob", name: "Bob", points: 950 },
];

const MEDALS = ["🥇", "🥈", "🥉"];

/**
 * @typedef {object} Leader
 * @property {string|number} id
 * @property {string} name
 * @property {number} points
 * @property {string} [avatarUrl]
 */

/**
 * @param {number} points
 * @returns {string} locale-formatted points, e.g. "1,200"
 */
function formatPoints(points) {
  return Number(points ?? 0).toLocaleString();
}

/**
 * Loading skeleton so the page doesn't flash blank while rankings load.
 * @param {{ count?: number }} props
 */
function LeaderboardSkeleton({ count = 6 }) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-2xl px-6 py-10 sm:py-14">
        <div className="h-4 w-20 animate-pulse rounded-full bg-white/10" />
        <div className="mt-3 h-8 w-48 animate-pulse rounded-lg bg-white/10" />
        <div className="mt-8 space-y-2">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    </main>
  );
}

/**
 * Shown when the rankings request fails, with a way to retry.
 * @param {{ onRetry?: () => void }} props
 */
function LeaderboardError({ onRetry }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-sm text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Something went wrong</p>
        <h1 className="mt-2 text-xl font-semibold">Couldn't load the leaderboard</h1>
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
 * Shown when there are genuinely no ranked players yet.
 */
function LeaderboardEmpty() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-sm text-center">
        <h1 className="text-xl font-semibold">No rankings yet</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Complete a challenge to be the first on the board.
        </p>
      </div>
    </main>
  );
}

/**
 * A single ranked row: position, name, and points, highlighted when it
 * belongs to the current user.
 * @param {{ leader: Leader, rank: number, isCurrentUser: boolean }} props
 */
function LeaderboardRow({ leader, rank, isCurrentUser }) {
  return (
    <li
      className={`flex items-center gap-4 rounded-xl border px-4 py-3 transition ${
        isCurrentUser ? "border-white/30 bg-white/10" : "border-white/10 bg-white/5"
      }`}
    >
      <span
        className="w-8 shrink-0 text-center text-lg font-semibold text-slate-400"
        aria-hidden={rank <= 3 ? "true" : undefined}
      >
        {MEDALS[rank - 1] ?? `#${rank}`}
      </span>

      {leader.avatarUrl ? (
        <img src={leader.avatarUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold uppercase"
        >
          {leader.name?.[0] ?? "?"}
        </span>
      )}

      <span className="flex-1 truncate font-medium">
        {leader.name}
        {isCurrentUser && <span className="ml-2 text-xs font-normal text-slate-400">(you)</span>}
      </span>

      <span className="shrink-0 font-semibold tabular-nums">{formatPoints(leader.points)} pts</span>
    </li>
  );
}

/**
 * Leaderboard page: ranks players by points, highlighting the current
 * user's position if present in the list.
 *
 * @param {object} props
 * @param {Leader[]} [props.leaders] - ranked players, already sorted by the caller. Falls back to placeholder data when omitted, so the page still renders standalone.
 * @param {string|number} [props.currentUserId] - if provided, that row is visually highlighted.
 * @param {boolean} [props.isLoading=false]
 * @param {Error|string|null} [props.error=null]
 * @param {() => void} [props.onRetry]
 */
export default function Leaderboards({ leaders, currentUserId, isLoading = false, error = null, onRetry }) {
  if (isLoading) return <LeaderboardSkeleton />;
  if (error) return <LeaderboardError onRetry={onRetry} />;

  const list = leaders ?? FALLBACK_LEADERS;
  if (list.length === 0) return <LeaderboardEmpty />;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-2xl px-6 py-10 sm:py-14">
        <header>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Rankings</p>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            <span aria-hidden="true">🏆</span> Leaderboard
          </h1>
        </header>

        <ol className="mt-8 space-y-2" aria-label="Player rankings">
          {list.map((leader, i) => (
            <LeaderboardRow key={leader.id ?? leader.name} leader={leader} rank={i + 1} isCurrentUser={leader.id === currentUserId} />
          ))}
        </ol>
      </div>
    </main>
  );
}