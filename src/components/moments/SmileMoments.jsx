//C:\code\KeshApp\VibeHub\src\components\moments\SmileMoments.jsx
// import SmileMomentCard from "./SmileMomentCard";
// import CreateSmileMoment from "./CreateSmileMoment";
// import { useMoments } from "./MomentsProvider";

// export default function SmileMoments({ user }) {
//   const {
//     loading,
//     recentGroups,
//     viewedGroups,
//     viewedIds,
//     recentlyMovedUserIds,
//     openMoment,
//     handleCreated,
//   } = useMoments();

//   if (loading) {
//     return (
//       <div className="flex gap-3 overflow-hidden py-3">
//         {[1, 2, 3, 4, 5].map((i) => (
//           <div key={i} className="w-14 h-14 rounded-full bg-slate-700 animate-pulse" />
//         ))}
//       </div>
//     );
//   }

//   // recentGroups (unwatched) first, viewedGroups (fully watched, most
//   // recently finished first) after — this is what puts a just-finished
//   // moment at the tail of the row, next to the last unwatched one,
//   // instead of leaving it sorted by original post time.
//   const orderedGroups = [...recentGroups, ...viewedGroups];

//   return (
//     <div className="flex gap-3 overflow-x-auto py-3 scrollbar-none snap-x snap-mandatory scroll-smooth">
//       {user && (
//         <div className="snap-start shrink-0">
//           <CreateSmileMoment user={user} onCreated={handleCreated} />
//         </div>
//       )}

//       {orderedGroups.map((group) => {
//         const authorId = group[0].user_id;
//         const seen = group.every((m) => viewedIds.has(m.id));
//         const justMoved = recentlyMovedUserIds.has(authorId);

//         return (
//           <div
//             key={authorId}
//             className={`snap-start shrink-0 ${
//               justMoved ? "animate-[moment-slide_0.5s_ease-out]" : ""
//             }`}
//           >
//             <SmileMomentCard
//               group={group}
//               seen={seen}
//               onClick={() => openMoment(authorId)}
//             />
//           </div>
//         );
//       })}

//       {!orderedGroups.length && !user && (
//         <p className="text-sm text-slate-400 py-3">No smile moments yet 🌱</p>
//       )}
//     </div>
//   );
// }

//C:\code\KeshApp\VibeHub\src\components\moments\SmileMoments.jsx
import { Link } from "react-router-dom";
import SmileMomentCard from "./SmileMomentCard";
import CreateSmileMoment from "./CreateSmileMoment";
import { useMoments } from "./MomentsProvider";

export default function SmileMoments({ user }) {
  const {
    loading,
    recentGroups,
    viewedGroups,
    viewedIds,
    recentlyMovedUserIds,
    openMoment,
    handleCreated,
  } = useMoments();

  if (loading) {
    return (
      <div className="flex gap-3 overflow-hidden py-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-14 h-14 rounded-full bg-slate-700 animate-pulse" />
        ))}
      </div>
    );
  }

  const orderedGroups = [...recentGroups, ...viewedGroups];

  return (
    <div className="flex gap-3 overflow-x-auto py-3 scrollbar-none snap-x snap-mandatory scroll-smooth">
      {user && (
        <div className="snap-start shrink-0 flex flex-col items-center gap-1">
          <CreateSmileMoment user={user} onCreated={handleCreated} />
          <Link
            to="/moments"
            className="text-[11px] text-white font-bold text-center leading-tight hover:text-yellow-400 transition-colors"
          >
            Smile Moments
          </Link>
        </div>
      )}

      {orderedGroups.map((group) => {
        const authorId = group[0].user_id;
        const seen = group.every((m) => viewedIds.has(m.id));
        const justMoved = recentlyMovedUserIds.has(authorId);

        return (
          <div
            key={authorId}
            className={`snap-start shrink-0 ${
              justMoved ? "animate-[moment-slide_0.5s_ease-out]" : ""
            }`}
          >
            <SmileMomentCard
              group={group}
              seen={seen}
              onClick={() => openMoment(authorId)}
            />
          </div>
        );
      })}

      {!orderedGroups.length && !user && (
        <p className="text-sm text-slate-400 py-3">No smile moments yet 🌱</p>
      )}
    </div>
  );
}