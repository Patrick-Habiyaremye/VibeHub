import { useEffect, useState, useRef } from "react";
import { supabase } from "../../supabaseClient";

export default function StoryViewer({
  moments,
  startIndex = 0,
  user,
  onClose,
}) {
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);

  const intervalRef = useRef(null);
  const hold = useRef(false);

  const current = moments[index];

  // ----------------------------
  // 1. VIEW TRACKING (FIXED)
  // ----------------------------
  useEffect(() => {
    if (!current || !user) return;

    const markViewed = async () => {
      await supabase.from("smile_moment_views").upsert({
        moment_id: current.id,
        user_id: user.id,
      });
    };

    markViewed();
  }, [index, current, user]);

  // ----------------------------
  // 2. TIMER (AUTO STORY FLOW)
  // ----------------------------
  useEffect(() => {
    if (!current) return;

    setProgress(0);

    intervalRef.current = setInterval(() => {
      if (hold.current) return;

      setProgress((p) => {
        if (p >= 100) {
          goNext();
          return 0;
        }
        return p + 2;
      });
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [index, current]);

  // ----------------------------
  // NAVIGATION
  // ----------------------------
  const goNext = () => {
    if (index < moments.length - 1) {
      setIndex((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (index > 0) {
      setIndex((i) => i - 1);
      setProgress(0);
    }
  };

  // ----------------------------
  // REACTIONS (READY FOR UI)
  // ----------------------------
  const reactToStory = async (reaction) => {
    if (!user || !current) return;

    await supabase.from("smile_moment_reactions").insert({
      moment_id: current.id,
      user_id: user.id,
      reaction,
    });
  };

  // ----------------------------
  // REPLY TO STORY (DM SYSTEM)
  // ----------------------------
  const replyToStory = async (text) => {
    if (!user || !current) return;

    await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: current.user_id,
      content: text,
      story_id: current.id,
    });
  };

  if (!current) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col text-white">

      {/* PROGRESS BAR */}
      <div className="flex gap-1 p-2">
        {moments.map((_, i) => (
          <div key={i} className="flex-1 h-1 bg-slate-700">
            {i === index && (
              <div
                className="h-1 bg-white"
                style={{ width: `${progress}%` }}
              />
            )}
          </div>
        ))}
      </div>

      {/* TOUCH ZONES */}
      <div className="absolute inset-0 flex">
        <div className="flex-1" onClick={goPrev} />

        <div
          className="flex-1"
          onMouseDown={() => (hold.current = true)}
          onMouseUp={() => (hold.current = false)}
          onTouchStart={() => (hold.current = true)}
          onTouchEnd={() => (hold.current = false)}
        />

        <div className="flex-1" onClick={goNext} />
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex items-center justify-center">
        {current.media_type === "image" && (
          <img src={current.media_url} className="max-h-full" />
        )}

        {current.media_type === "video" && (
          <video src={current.media_url} autoPlay className="max-h-full" />
        )}

        {current.media_type === "text" && (
          <p className="text-xl p-6">{current.caption}</p>
        )}
      </div>

      {/* CLOSE BUTTON */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-xl"
      >
        ✕
      </button>

    </div>
  );
}