import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

import { useNotifications } from "../../context/NotificationContext";

import VibeStats from "../feed/VibeStats";
import SuggestedSupporters from "../feed/SuggestedSupporters";
import ReelPreview from "../feed/ReelPreview";

export default function RightPanel() {
  // ✅ No local `open` state and no local <NotificationModal> anymore —
  // this card is just another trigger for the one shared panel that
  // Navbar renders. That's what stops two notification surfaces from
  // ever appearing on screen at the same time.
  const { unreadCount, openPanel } = useNotifications();

  const [challenge, setChallenge] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  // -----------------------
  // LOAD DATA
  // -----------------------
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const [challengeRes, quoteRes] = await Promise.all([
        supabase
          .from("challenges")
          .select("*")
          .eq("active", true)
          .maybeSingle(),

        supabase
          .from("quotes")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1),
      ]);

      if (!challengeRes.error) setChallenge(challengeRes.data);
      if (!quoteRes.error)
        setQuote(quoteRes.data?.[0] || null);

      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <aside className="hidden sm:block w-80 shrink-0">
      <div className="sticky top-[72px] max-h-[calc(100vh-90px)] overflow-y-auto space-y-4 pr-1">

        {/* 🔔 Notifications */}
        <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <button
            onClick={openPanel}
            className="relative w-full text-left"
          >
            <h2 className="font-bold text-blue-400 mb-2">
              🔔 Notifications
            </h2>

            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          <p className="text-slate-400 text-sm">
            Tap to view
          </p>
        </section>

        {/* 🌟 Challenge */}
        <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <h2 className="font-bold text-yellow-400 mb-2">
            🌟 Today's Challenge
          </h2>

          {loading ? (
            <p className="text-slate-400 text-sm">
              Loading...
            </p>
          ) : (
            <p className="text-slate-300">
              {challenge?.description ||
                "Make 3 people smile today 😊"}
            </p>
          )}
        </section>

        <VibeStats />
        <SuggestedSupporters />
        <ReelPreview />

        {/* ✨ Quote */}
        <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <h2 className="font-bold text-pink-400 mb-3">
            ✨ Daily Vibe
          </h2>

          <blockquote className="italic text-slate-300">
            {quote?.text ||
              "Kindness is free. Sprinkle it everywhere."}
          </blockquote>
        </section>
      </div>
    </aside>
  );
}