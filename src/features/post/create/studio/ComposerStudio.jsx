import React, { useEffect, useMemo } from "react";
import BlockEditor from "./BlockEditor";
import PublishProgress from "./PublishProgress";
import { useComposerSession } from "../hooks/useComposerSession";
import { listMoods, resolveMoodTheme } from "../engines/StyleEngine";

/* ============================================================
   🎯 DESIGN TOKEN LAYER (LOCAL ADAPTER)
   - isolates UI from engine shape
   - future: can be replaced by global token system
============================================================ */

const TOKENS = {
  radius: {
    full: 9999,
    lg: 20,
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  typography: {
    serif: "'Fraunces', Georgia, serif",
  },
};

/* ============================================================
   🎯 THEME ADAPTER (CRITICAL)
   Converts StyleEngine → UI-safe tokens
============================================================ */

function useTheme(moodKey) {
  return useMemo(() => {
    const raw = resolveMoodTheme(moodKey);

    return {
      background: raw.gradient || "#ccc",
      accent: raw.accent || "#999",
      text: raw.text || "#111",
      label: raw.label || "Neutral",
    };
  }, [moodKey]);
}

/* ============================================================
   🎯 UI SUBCOMPONENTS (LOCAL, SCALABLE)
============================================================ */
function normalizeAudiences(input) {
  if (!input) return [];

  // Case 1: already array
  if (Array.isArray(input)) return input;

  // Case 2: object (like AUDIENCES enum)
  if (typeof input === "object") {
    return Object.values(input);
  }

  return [];
}

function AudiencePicker({ value, audiences, onChange }) {
  const options = normalizeAudiences(audiences);

  if (options.length === 0) {
    console.warn("[AudiencePicker] No valid audiences provided");
    return null; // or fallback UI
  }
   
  return (
    <select
      value={value || options[0]}
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-800 text-white text-sm rounded-full px-4 py-2"
    >
      {options.map((a) => (
        <option key={a} value={a}>
          {a}
        </option>
      ))}
    </select>
  );
}

function MoodPicker({ value, onChange }) {
  const moods = listMoods();

  return (
    <div className="flex gap-2 mt-4 flex-wrap">
      {moods.map((m) => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className={`px-4 py-2 rounded-full text-xs font-medium border ${
            value === m.key
              ? "bg-white text-black"
              : "bg-transparent text-white border-white/20"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   🎯 MAIN COMPONENT
============================================================ */

export default function ComposerStudio({ authorId, api, onPublished }) {
  const {
    draft,
    summary,
    status,
    error,
    progress,
    audiences,
    actions,
  } = useComposerSession({
    authorId,
    api,
  });

  const theme = useTheme(draft.theme?.mood);

  /* ---------------- AUTO MOOD SUGGEST ---------------- */

  useEffect(() => {
    const t = setTimeout(actions.autoSuggestMood, 800);
    return () => clearTimeout(t);
  }, [draft.blocks, actions]);

  /* ---------------- HANDLERS ---------------- */

  const handlePublish = async () => {
    try {
      const result = await actions.publish();
      onPublished?.(result);
    } catch {
      // handled globally
    }
  };

  const isPublishing = status === "publishing";

  /* ============================================================
     🎨 RENDER
  ============================================================ */

  return (
    <div
      className="max-w-[920px] mx-auto rounded-[20px] p-6 text-white"
      style={{
        background: theme.background,
        transition: "all 0.3s ease",
      }}
    >
      {/* HEADER */}
      <header className="flex items-center justify-between mb-5">
        <h1
          className="text-[28px] font-semibold m-0"
          style={{ fontFamily: TOKENS.typography.serif }}
        >
          What's your vibe?
        </h1>

        <AudiencePicker
          value={draft.audience}
          audiences={audiences}
          onChange={actions.setAudience}
        />
      </header>

      {/* EDITOR */}
      <BlockEditor
        blocks={draft.blocks}
        onAddBlock={actions.addBlock}
        onUpdateBlock={actions.updateBlock}
        onRemoveBlock={actions.removeBlock}
        onReorder={actions.reorderBlocks}
      />

      {/* MOOD PICKER */}
      <MoodPicker value={draft.theme?.mood} onChange={actions.setMood} />

      {/* FOOTER */}
      <footer className="flex items-center justify-between mt-6">
        <span className="text-xs opacity-80">
          {summary.total} block{summary.total === 1 ? "" : "s"}
        </span>

        <button
          type="button"
          disabled={isPublishing || summary.total === 0}
          onClick={handlePublish}
          className="rounded-full px-7 py-3 text-sm font-semibold transition disabled:opacity-40"
          style={{
            background: theme.accent,
            color: "#fff",
          }}
        >
          {isPublishing ? "Publishing…" : "Publish"}
        </button>
      </footer>

      {/* PROGRESS OVERLAY */}
      <PublishProgress
        status={status}
        progress={progress}
        error={error}
        onRetry={actions.publish}
      />
    </div>
  );
}