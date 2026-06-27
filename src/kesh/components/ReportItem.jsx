// components/ReportItem.jsx

// 

export default function ReportItem({ report, onResolve }) {
  return (
    <div className="bg-slate-800 p-3 rounded-lg mb-2">
      <div className="text-white">{report.reason}</div>
      <div className="text-slate-400 text-sm">{report.description}</div>

      <button
        onClick={() => onResolve(report.id)}
        className="mt-2 bg-green-500 px-3 py-1 rounded"
      >
        Resolve
      </button>
    </div>
  );
}