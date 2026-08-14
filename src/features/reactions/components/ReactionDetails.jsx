// FILE: src/features/reactions/components/ReactionDetails.jsx

import { REACTION_LIST } from "../utils/reactionTypes";

export default function ReactionDetails({ total, counts, loading, onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reaction-details-title"
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 id="reaction-details-title" className="text-white text-base font-semibold">
            Reactions
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading…</p>
        ) : (
          <ul className="space-y-2">
            {REACTION_LIST.map(({ type, emoji, label }) => (
              <li
                key={type}
                className="flex items-center justify-between text-sm text-slate-200"
              >
                <span>
                  {emoji} {label}
                </span>
                <span className="text-slate-400">{counts?.[type] ?? 0}</span>
              </li>
            ))}
            <li className="flex items-center justify-between text-sm font-semibold text-white border-t border-slate-700 pt-2 mt-2">
              <span>Total</span>
              <span>{total}</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}