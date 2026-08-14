// components/ChartBox.jsx

export default function ChartBox({ title, children }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
      <h2 className="text-white font-bold mb-3">{title}</h2>
      {children}
    </div>
  );
}