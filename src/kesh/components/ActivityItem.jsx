// components/ActivityItem.jsx

// export default function ActivityItem({ activity }) {
//   return (
//     <div className="flex items-center justify-between py-2 border-b border-slate-700">
//       <div className="text-slate-300 text-sm">
//         {activity.text}
//       </div>

//       <span className="text-xs text-slate-500">
//         {activity.time}
//       </span>
//     </div>
//   );
// }

export default function ActivityItem({ activity }) {
  return (
    <div className="text-sm text-slate-300 border-b border-slate-700 py-2">
      {activity.text}
    </div>
  );
}