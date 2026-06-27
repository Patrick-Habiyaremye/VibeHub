import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../supabaseClient";

import SmileMomentCard from "./SmileMomentCard";
import StoryViewer from "./StoryViewer";
import useSmileMoments from "../../hooks/useSmileMoments";

export default function SmileMoments({ user }) {
  const [moments, setMoments] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  // -----------------------
  // LOAD STORIES
  // -----------------------
  const loadMoments = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("smile_moments")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMoments(data || []);
    } catch (err) {
      console.error("SmileMoments load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMoments();
  }, [loadMoments]);

  // -----------------------
  // REALTIME ENGINE
  // -----------------------
  useSmileMoments({
    onInsert: (story) => {
      setMoments((prev) => {
        const exists = prev.some((m) => m.id === story.id);
        if (exists) return prev;
        return [story, ...prev];
      });
    },

    onReaction: (reaction) => {
      setMoments((prev) =>
        prev.map((m) =>
          m.id === reaction.moment_id
            ? {
                ...m,
                reactions_count: (m.reactions_count || 0) + 1,
              }
            : m
        )
      );
    },

    onView: (view) => {
      setMoments((prev) =>
        prev.map((m) =>
          m.id === view.moment_id
            ? {
                ...m,
                views_count: (m.views_count || 0) + 1,
              }
            : m
        )
      );
    },
  });

  // -----------------------
  // LOADING STATE
  // -----------------------
  if (loading) {
    return (
      <div className="flex gap-3 overflow-hidden py-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="
              w-14 h-14
              rounded-full
              bg-slate-700
              animate-pulse
            "
          />
        ))}
      </div>
    );
  }

  // -----------------------
  // EMPTY STATE
  // -----------------------
  if (!moments.length) {
    return (
      <div className="text-sm text-slate-400 py-3">
        No smile moments yet 🌱
      </div>
    );
  }

  return (
    <>
      {/* STORY RING BAR (INSTAGRAM STYLE) */}
      <div
        className="
          flex
          gap-3
          overflow-x-auto
          py-3
          scrollbar-none

          snap-x
          snap-mandatory
          scroll-smooth
        "
      >
        {moments.map((m, i) => (
          <div
            key={m.id}
            className="snap-start shrink-0"
          >
            <SmileMomentCard
              moment={m}
              onClick={() => setActive(i)}
            />
          </div>
        ))}
      </div>

      {/* STORY VIEWER */}
      {active !== null && (
        <StoryViewer
          moments={moments}
          startIndex={active}
          user={user}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}