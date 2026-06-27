// components/ChartBox.jsx

// export default function ChartBox({ title, children }) {
//   return (
//     <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
//       <h2 className="text-white font-bold mb-4">
//         {title}
//       </h2>

//       <div className="w-full h-64 flex items-center justify-center text-slate-400">
//         {children || "Chart goes here"}
//       </div>
//     </div>
//   );
// }

export default function ChartBox({ title, children }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
      <h2 className="text-white font-bold mb-3">{title}</h2>
      {children}
    </div>
  );
}