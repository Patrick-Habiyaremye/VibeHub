// components/StatCard.jsx

// export default function StatCard({
//   title,
//   value,
//   icon,
//   color = "yellow",
//   subtitle,
// }) {
//   const colorMap = {
//     yellow: "text-yellow-400 border-yellow-500/30",
//     blue: "text-blue-400 border-blue-500/30",
//     green: "text-green-400 border-green-500/30",
//     red: "text-red-400 border-red-500/30",
//   };

//   return (
//     <div className={`
//       bg-slate-800
//       border
//       ${colorMap[color]}
//       rounded-2xl
//       p-5
//       flex
//       flex-col
//       gap-2
//       hover:scale-[1.02]
//       transition
//     `}>
//       <div className="flex items-center justify-between">
//         <h3 className="text-slate-300 text-sm">{title}</h3>
//         <span className="text-xl">{icon}</span>
//       </div>

//       <div className="text-2xl font-bold text-white">
//         {value}
//       </div>

//       {subtitle && (
//         <p className="text-xs text-slate-400">{subtitle}</p>
//       )}
//     </div>
//   );
// }

export default function StatCard({ label, value, icon }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
      <div className="text-slate-400 text-sm">{label}</div>
      <div className="text-2xl font-bold text-white mt-1">
        {icon} {value}
      </div>
    </div>
  );
}