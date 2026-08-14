// components/StatCard.jsx

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