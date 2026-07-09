// import { useEffect, useState } from "react";
// import { supabase } from "../../supabaseClient";

// import VibeStats from "../feed/VibeStats";
// import SuggestedSupporters from "../feed/SuggestedSupporters";
// import ReelPreview from "../feed/ReelPreview";

// export default function RightPanel() {
//   const [notifications, setNotifications] = useState([]);
//   const [challenge, setChallenge] = useState(null);
//   const [quote, setQuote] = useState(null);

//   const [loading, setLoading] = useState(true);

//   // -----------------------
//   // LOAD INITIAL DATA
//   // -----------------------
//   async function loadData() {
//   setLoading(true);

//   const notifPromise = supabase
//     .from("notifications")
//     .select("*")
//     .order("created_at", { ascending: false })
//     .limit(5);

//   const challengePromise = supabase
//     .from("challenges")
//     .select("*")
//     .eq("active", true)
//     .maybeSingle();

//   const quotePromise = supabase
//     .from("quotes")
//     .select("*")
//     .order("created_at", { ascending: false })
//     .limit(1);

//   const [
//     notifRes,
//     challengeRes,
//     quoteRes,
//   ] = await Promise.allSettled([
//     notifPromise,
//     challengePromise,
//     quotePromise,
//   ]);

//   if (
//     notifRes.status === "fulfilled" &&
//     !notifRes.value.error
//   ) {
//     setNotifications(notifRes.value.data || []);
//   }

//   if (
//     challengeRes.status === "fulfilled" &&
//     !challengeRes.value.error
//   ) {
//     setChallenge(challengeRes.value.data);
//   }

//   if (
//     quoteRes.status === "fulfilled" &&
//     !quoteRes.value.error
//   ) {
//     setQuote(quoteRes.value.data?.[0] || null);
//   }

//   setLoading(false);
// }

//   // -----------------------
//   // REALTIME NOTIFICATIONS
//   // -----------------------

//   useEffect(() => {
//   let mounted = true;

//   const channel = supabase.channel(
//     `right-panel-${crypto.randomUUID()}`
//   );

//   channel.on(
//     "postgres_changes",
//     {
//       event: "INSERT",
//       schema: "public",
//       table: "notifications",
//     },
//     (payload) => {
//       if (!mounted) return;

//       setNotifications((prev) => [
//         payload.new,
//         ...prev.slice(0, 4),
//       ]);
//     }
//   );

//   channel.subscribe((status) => {
//     console.log("Realtime:", status);
//   });

//   return () => {
//     mounted = false;
//     supabase.removeChannel(channel);
//   };
// }, []);

// // useEffect(() => {
// //   const channel = supabase.channel("right-panel-notifications");

// //   channel.on(
// //     "postgres_changes",
// //     {
// //       event: "*",
// //       schema: "public",
// //       table: "posts",
// //     },
// //     (payload) => {
// //       console.log(payload);
// //     }
// //   );

// //   channel.subscribe();

// //   return () => {
// //     supabase.removeChannel(channel);
// //   };
// // }, []);

//   return (
//     <aside
//       className="
//         xl:block
//         w-80
//         shrink-0
//       "
//     >
//       <div
//         className="
//           sticky
//           top-[72px]
//           max-h-[calc(100vh-90px)]
//           overflow-y-auto
//           space-y-4
//           pr-1
//         "
//       >
//         {/* -------------------- CHALLENGE -------------------- */}

//         <section className="
//           bg-slate-800 border border-slate-700 rounded-2xl p-5
//         ">
//           <h2 className="font-bold text-yellow-400 mb-2">
//             🌟 Today's Challenge
//           </h2>

//           {loading ? (
//             <p className="text-slate-400 text-sm">
//               Loading...
//             </p>
//           ) : (
//             <p className="text-slate-300">
//               {challenge?.description ||
//                 "Make 3 people smile today 😊"}
//             </p>
//           )}
//         </section>

//         {/* -------------------- STATS -------------------- */}

//         <VibeStats />

//         {/* -------------------- SUPPORTERS -------------------- */}

//         <SuggestedSupporters />

//         {/* -------------------- REELS -------------------- */}

//         <ReelPreview />

//         {/* -------------------- NOTIFICATIONS (REALTIME) -------------------- */}

//         <section
//           className="
//             bg-slate-800
//             border
//             border-slate-700
//             rounded-2xl
//             p-5
//           "
//         >
//           <h2 className="font-bold text-blue-400 mb-4">
//             🔔 Notifications
//           </h2>

//           {notifications.length === 0 ? (
//             <p className="text-slate-400 text-sm">
//               No notifications yet
//             </p>
//           ) : (
//             <div className="space-y-3 text-sm">
//               {notifications.map((n) => (
//                 <div
//                   key={n.id}
//                   className="text-slate-300"
//                 >
//                   {n.content}
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>

//         {/* -------------------- QUICK POSITIVITY (STATIC OR LATER DB) -------------------- */}

//         <section
//           className="
//             bg-slate-800
//             border
//             border-slate-700
//             rounded-2xl
//             p-5
//           "
//         >
//           <h2 className="font-bold text-purple-400 mb-4">
//             💬 Quick Positivity
//           </h2>

//           <div className="flex flex-col gap-2">
//             {[
//               "🌟 Keep going!",
//               "💛 You inspired me!",
//               "😊 Have a wonderful day!",
//               "🌈 You matter!",
//             ].map((msg) => (
//               <button
//                 key={msg}
//                 className="
//                   rounded-xl
//                   bg-slate-700
//                   px-3
//                   py-3
//                   text-left
//                   text-white
//                   hover:bg-slate-600
//                   transition
//                 "
//               >
//                 {msg}
//               </button>
//             ))}
//           </div>
//         </section>

//         {/* -------------------- DAILY QUOTE -------------------- */}

//         <section
//           className="
//             bg-slate-800
//             border
//             border-slate-700
//             rounded-2xl
//             p-5
//           "
//         >
//           <h2 className="font-bold text-pink-400 mb-3">
//             ✨ Daily Vibe
//           </h2>

//           <blockquote className="italic text-slate-300">
//             {quote?.text ||
//               "Kindness is free. Sprinkle it everywhere."}
//           </blockquote>
//         </section>
//       </div>
//     </aside>
//   );
// }

// import { useEffect, useState } from "react";
// import { supabase } from "../../supabaseClient";

// import useNotifications from "../../hooks/useNotifications";
// import NotificationModal from "../notification/NotificationModal";

// import VibeStats from "../feed/VibeStats";
// import SuggestedSupporters from "../feed/SuggestedSupporters";
// import ReelPreview from "../feed/ReelPreview";

// export default function RightPanel({ user }) {
//   const [open, setOpen] = useState(false);

//   // ✅ SINGLE SOURCE OF TRUTH
//   const notifications = useNotifications(user?.id);

//   const [challenge, setChallenge] = useState(null);
//   const [quote, setQuote] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // -----------------------
//   // LOAD STATIC DATA ONLY
//   // -----------------------
//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);

//       const [
//         challengeRes,
//         quoteRes,
//       ] = await Promise.all([
//         supabase
//           .from("challenges")
//           .select("*")
//           .eq("active", true)
//           .maybeSingle(),

//         supabase
//           .from("quotes")
//           .select("*")
//           .order("created_at", { ascending: false })
//           .limit(1),
//       ]);

//       if (!challengeRes.error) {
//         setChallenge(challengeRes.data);
//       }

//       if (!quoteRes.error) {
//         setQuote(quoteRes.data?.[0] || null);
//       }

//       setLoading(false);
//     };

//     loadData();
//   }, []);

//   return (
//     <>
//       {/* ---------------- PANEL ---------------- */}
//       <aside className="xl:block w-80 shrink-0">
//         <div className="sticky top-[72px] max-h-[calc(100vh-90px)] overflow-y-auto space-y-4 pr-1">

//           {/* 🔔 NOTIFICATION BUTTON */}
//           <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
//             <button
//               onClick={() => setOpen(true)}
//               className="relative w-full text-left"
//             >
//               <h2 className="font-bold text-blue-400 mb-2">
//                 🔔 Notifications
//               </h2>

//               {notifications.length > 0 && (
//                 <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
//                   {notifications.length}
//                 </span>
//               )}
//             </button>

//             <p className="text-slate-400 text-sm">
//               Tap to view all notifications
//             </p>
//           </section>

//           {/* 🌟 CHALLENGE */}
//           <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
//             <h2 className="font-bold text-yellow-400 mb-2">
//               🌟 Today's Challenge
//             </h2>

//             {loading ? (
//               <p className="text-slate-400 text-sm">Loading...</p>
//             ) : (
//               <p className="text-slate-300">
//                 {challenge?.description || "Make 3 people smile today 😊"}
//               </p>
//             )}
//           </section>

//           {/* 📊 STATS */}
//           <VibeStats />

//           {/* 🤝 SUPPORTERS */}
//           <SuggestedSupporters />

//           {/* 🎥 REELS */}
//           <ReelPreview />

//           {/* 💬 QUICK POSITIVITY */}
//           <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
//             <h2 className="font-bold text-purple-400 mb-4">
//               💬 Quick Positivity
//             </h2>

//             <div className="flex flex-col gap-2">
//               {[
//                 "🌟 Keep going!",
//                 "💛 You inspired me!",
//                 "😊 Have a wonderful day!",
//                 "🌈 You matter!",
//               ].map((msg) => (
//                 <button
//                   key={msg}
//                   className="rounded-xl bg-slate-700 px-3 py-3 text-left text-white hover:bg-slate-600 transition"
//                 >
//                   {msg}
//                 </button>
//               ))}
//             </div>
//           </section>

//           {/* ✨ QUOTE */}
//           <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
//             <h2 className="font-bold text-pink-400 mb-3">
//               ✨ Daily Vibe
//             </h2>

//             <blockquote className="italic text-slate-300">
//               {quote?.text || "Kindness is free. Sprinkle it everywhere."}
//             </blockquote>
//           </section>
//         </div>
//       </aside>

//       {/* 📱 MODAL (GLOBAL) */}
//       <NotificationModal
//         open={open}
//         onClose={() => setOpen(false)}
//         notifications={notifications}
//       />
//     </>
//   );
// }

import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

import useNotifications from "../../hooks/useNotifications";
import NotificationModal from "../notification/NotificationModal";

import VibeStats from "../feed/VibeStats";
import SuggestedSupporters from "../feed/SuggestedSupporters";
import ReelPreview from "../feed/ReelPreview";

export default function RightPanel({ user }) {
  const [open, setOpen] = useState(false);
  const notifications = useNotifications(user?.id);

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
    <>
      {/* ✅ Hidden on small screens */}
      <aside className="hidden sm:block w-80 shrink-0">
        <div className="sticky top-[72px] max-h-[calc(100vh-90px)] overflow-y-auto space-y-4 pr-1">

          {/* 🔔 Notifications */}
          <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <button
              onClick={() => setOpen(true)}
              className="relative w-full text-left"
            >
              <h2 className="font-bold text-blue-400 mb-2">
                🔔 Notifications
              </h2>

              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {notifications.length}
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

      {/* 🔔 Modal */}
      <NotificationModal
        open={open}
        onClose={() => setOpen(false)}
        notifications={notifications}
      />
    </>
  );
}