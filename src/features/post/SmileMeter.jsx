// // features/post/SmileMeter.jsx

// import { useEffect, useState } from "react";
// import { supabase } from "../../supabaseClient";

// export default function SmileMeter({ postId }) {

//   const [stats, setStats] = useState({
//     smiles: 0,
//     supporters: 0,
//     shares: 0,
//   });

//   const loadStats = async () => {

//     try {

//       const { count: smiles } =
//         await supabase
//           .from("reactions")
//           .select("*", {
//             count: "exact",
//             head: true,
//           })
//           .eq("post_id", postId);

//       const { count: supporters } =
//         await supabase
//           .from("reactions")
//           .select("user_id", {
//             count: "exact",
//             head: true,
//           })
//           .eq("post_id", postId);

//       const { count: shares } =
//         await supabase
//           .from("shares")
//           .select("*", {
//             count: "exact",
//             head: true,
//           })
//           .eq("post_id", postId);

//       setStats({
//         smiles: smiles || 0,
//         supporters: supporters || 0,
//         shares: shares || 0,
//       });

//     } catch (err) {

//       console.error(err);

//     }

//   };

//   useEffect(() => {

//     loadStats();

//     const channel =
//       supabase
//         .channel(`smile-meter-${postId}`)
//         .on(
//           "postgres_changes",
//           {
//             event: "*",
//             schema: "public",
//             table: "reactions",
//             filter: `post_id=eq.${postId}`,
//           },
//           loadStats
//         )
//         .subscribe();

//     return () => {

//       supabase.removeChannel(channel);

//     };

//   }, [postId]);

//   return (

//     <div
//       className="
//         mt-4
//         bg-slate-900
//         border
//         border-slate-700
//         rounded-xl
//         p-4
//       "
//     >

//       <div className="grid grid-cols-3 gap-3">

//         <div className="text-center">

//           <p className="text-2xl">
//             😊
//           </p>

//           <p className="text-yellow-400 font-bold">
//             {stats.smiles}
//           </p>

//           <p className="text-xs text-slate-400">
//             Smiles Created
//           </p>

//         </div>

//         <div className="text-center">

//           <p className="text-2xl">
//             💛
//           </p>

//           <p className="text-yellow-400 font-bold">
//             {stats.supporters}
//           </p>

//           <p className="text-xs text-slate-400">
//             Supporters Inspired
//           </p>

//         </div>

//         <div className="text-center">

//           <p className="text-2xl">
//             🌈
//           </p>

//           <p className="text-yellow-400 font-bold">
//             {stats.shares}
//           </p>

//           <p className="text-xs text-slate-400">
//             Positive Shares
//           </p>

//         </div>

//       </div>

//     </div>

//   );

// }

// features/post/SmileMeter.jsx

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../supabaseClient";

export default function SmileMeter({ postId }) {
  const [stats, setStats] = useState({
    smiles: 0,
    supporters: 0,
    shares: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      // Run all queries in parallel (faster than sequential)
      const [smilesRes, supportersRes, sharesRes] = await Promise.all([
        supabase
          .from("reactions")
          .select("*", { count: "exact", head: true })
          .eq("post_id", postId)
          .eq("type", "smile"),

        supabase
          .from("reactions")
          .select("*", { count: "exact", head: true })
          .eq("post_id", postId)
          .eq("type", "supporter"),

        supabase
          .from("shares")
          .select("*", { count: "exact", head: true })
          .eq("post_id", postId),
      ]);

      setStats({
        smiles: smilesRes.count || 0,
        supporters: supportersRes.count || 0,
        shares: sharesRes.count || 0,
      });
    } catch (err) {
      console.error("SmileMeter error:", err);
    }
  }, [postId]);

  useEffect(() => {
    loadStats();

    const channel = supabase
      .channel(`smile-meter-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reactions",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          // lightweight refresh instead of full reload logic
          loadStats();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shares",
          filter: `post_id=eq.${postId}`,
        },
        () => loadStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, loadStats]);

  return (
    <div className="mt-4 bg-slate-900 border border-slate-700 rounded-xl p-4">
      <div className="grid grid-cols-3 gap-3 text-center">

        <div>
          <p className="text-2xl">😊</p>
          <p className="text-yellow-400 font-bold">{stats.smiles}</p>
          <p className="text-xs text-slate-400">Smiles Created</p>
        </div>

        <div>
          <p className="text-2xl">💛</p>
          <p className="text-yellow-400 font-bold">{stats.supporters}</p>
          <p className="text-xs text-slate-400">Supporters Inspired</p>
        </div>

        <div>
          <p className="text-2xl">🌈</p>
          <p className="text-yellow-400 font-bold">{stats.shares}</p>
          <p className="text-xs text-slate-400">Positive Shares</p>
        </div>

      </div>
    </div>
  );
}