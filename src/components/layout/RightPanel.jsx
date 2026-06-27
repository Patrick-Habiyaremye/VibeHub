// import VibeStats from "../feed/VibeStats";
// import SuggestedSupporters from "../feed/SuggestedSupporters";
// import ReelPreview from "../feed/ReelPreview";

// export default function RightPanel() {
//   return (
//     <aside
//       className="
//         w-80
//         shrink-0
//       "
//     >
//       <div
//         className="
//           sticky
//           top-20
//           space-y-4
//         "
//       >
//         {/* Daily Challenge */}
//         <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
//           <h2 className="text-yellow-400 font-bold mb-2">
//             🌟 Today's Challenge
//           </h2>

//           <p className="text-slate-300">
//             Make 3 people smile today 😊
//           </p>
//         </div>

//         {/* Community Impact */}
//         <VibeStats />

//         {/* Supporters */}
//         <SuggestedSupporters />

//         {/* Reels */}
//         <ReelPreview />

//         {/* Notifications */}
//         <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
//           <h2 className="text-blue-400 font-bold mb-3">
//             🔔 Notifications
//           </h2>

//           <div className="space-y-2 text-sm">
//             <p className="text-slate-300">
//               Sarah supported your post 💛
//             </p>

//             <p className="text-slate-300">
//               John reacted 😊
//             </p>

//             <p className="text-slate-300">
//               Emma completed today's challenge 🌈
//             </p>
//           </div>
//         </div>

//         {/* Quick Messages */}
//         <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
//           <h2 className="text-purple-400 font-bold mb-3">
//             💬 Quick Positivity
//           </h2>

//           <div className="flex flex-col gap-2">
//             <button className="bg-slate-700 rounded-lg p-2 text-left text-white hover:bg-slate-600">
//               🌟 Keep going!
//             </button>

//             <button className="bg-slate-700 rounded-lg p-2 text-left text-white hover:bg-slate-600">
//               💛 You inspired me!
//             </button>

//             <button className="bg-slate-700 rounded-lg p-2 text-left text-white hover:bg-slate-600">
//               😊 Have a wonderful day!
//             </button>

//             <button className="bg-slate-700 rounded-lg p-2 text-left text-white hover:bg-slate-600">
//               🌈 You matter!
//             </button>
//           </div>
//         </div>

//         {/* Daily Vibe */}
//         <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
//           <h2 className="text-pink-400 font-bold mb-2">
//             ✨ Daily Vibe
//           </h2>

//           <p className="text-slate-300 italic">
//             "Kindness is free. Sprinkle it everywhere."
//           </p>
//         </div>
//       </div>
//     </aside>
//   );
// }

import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

import VibeStats from "../feed/VibeStats";
import SuggestedSupporters from "../feed/SuggestedSupporters";
import ReelPreview from "../feed/ReelPreview";

export default function RightPanel() {
  const [notifications, setNotifications] = useState([]);
  const [challenge, setChallenge] = useState(null);
  const [quote, setQuote] = useState(null);

  const [loading, setLoading] = useState(true);

  // -----------------------
  // LOAD INITIAL DATA
  // -----------------------
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const [notifRes, challengeRes, quoteRes] = await Promise.all([
        supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),

        supabase
          .from("challenges")
          .select("*")
          .eq("active", true)
          .single(),

        supabase
          .from("quotes")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1),
      ]);

      setNotifications(notifRes.data || []);
      setChallenge(challengeRes.data || null);
      setQuote(quoteRes.data?.[0] || null);

      setLoading(false);
    }

    loadData();
  }, []);

  // -----------------------
  // REALTIME NOTIFICATIONS
  // -----------------------
  useEffect(() => {
    const channel = supabase
      .channel("right-panel-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          setNotifications((prev) => [
            payload.new,
            ...prev.slice(0, 4),
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <aside
      className="
        hidden
        xl:block
        w-80
        shrink-0
      "
    >
      <div
        className="
          sticky
          top-[72px]
          max-h-[calc(100vh-90px)]
          overflow-y-auto
          space-y-4
          pr-1
        "
      >
        {/* -------------------- CHALLENGE -------------------- */}

        <section className="
          bg-slate-800 border border-slate-700 rounded-2xl p-5
        ">
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

        {/* -------------------- STATS -------------------- */}

        <VibeStats />

        {/* -------------------- SUPPORTERS -------------------- */}

        <SuggestedSupporters />

        {/* -------------------- REELS -------------------- */}

        <ReelPreview />

        {/* -------------------- NOTIFICATIONS (REALTIME) -------------------- */}

        <section
          className="
            bg-slate-800
            border
            border-slate-700
            rounded-2xl
            p-5
          "
        >
          <h2 className="font-bold text-blue-400 mb-4">
            🔔 Notifications
          </h2>

          {notifications.length === 0 ? (
            <p className="text-slate-400 text-sm">
              No notifications yet
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="text-slate-300"
                >
                  {n.content}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* -------------------- QUICK POSITIVITY (STATIC OR LATER DB) -------------------- */}

        <section
          className="
            bg-slate-800
            border
            border-slate-700
            rounded-2xl
            p-5
          "
        >
          <h2 className="font-bold text-purple-400 mb-4">
            💬 Quick Positivity
          </h2>

          <div className="flex flex-col gap-2">
            {[
              "🌟 Keep going!",
              "💛 You inspired me!",
              "😊 Have a wonderful day!",
              "🌈 You matter!",
            ].map((msg) => (
              <button
                key={msg}
                className="
                  rounded-xl
                  bg-slate-700
                  px-3
                  py-3
                  text-left
                  text-white
                  hover:bg-slate-600
                  transition
                "
              >
                {msg}
              </button>
            ))}
          </div>
        </section>

        {/* -------------------- DAILY QUOTE -------------------- */}

        <section
          className="
            bg-slate-800
            border
            border-slate-700
            rounded-2xl
            p-5
          "
        >
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