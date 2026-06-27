// import { useEffect, useState } from "react";
// import { supabase } from "../../supabaseClient";

// export default function Activity() {
//   const [events, setEvents] = useState([]);

//   useEffect(() => {
//     load();

//     const channel = supabase
//       .channel("activity-stream")
//       .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, payload => {
//         setEvents(prev => [
//           {
//             type: "post",
//             message: "New post created",
//             data: payload.new,
//           },
//           ...prev,
//         ]);
//       })
//       .subscribe();

//     return () => supabase.removeChannel(channel);
//   }, []);

//   async function load() {
//     const { data } = await supabase
//       .from("posts")
//       .select("*")
//       .order("created_at", { ascending: false })
//       .limit(20);

//     setEvents(
//       (data || []).map((p) => ({
//         type: "post",
//         message: "Post loaded",
//         data: p,
//       }))
//     );
//   }

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-6">⚡ Live Activity</h1>

//       <div className="space-y-3">
//         {events.map((e, i) => (
//           <div
//             key={i}
//             className="bg-slate-800 p-3 rounded-lg border border-slate-700"
//           >
//             <p className="text-white">{e.message}</p>
//             <p className="text-slate-400 text-sm truncate">
//               {e.data?.content || "System event"}
//             </p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import AdminLayout from "../AdminLayout";
import LiveTicker from "../components/LiveTicker";

export default function Activity() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Activity</h1>
      <LiveTicker />
    </AdminLayout>
  );
}