// components/ReportItem.jsx
import { useEffect, useState } from "react";
import useAIModeration from "../hooks/useAIModeration";
import AIModerationBadge from "./AIModerationBadge";

export default function ReportItem({ report, onResolve }) {
  const { analyzeText, loading } = useAIModeration();
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // Analyze the reported content itself, if present, so moderators get
    // a quick risk read before opening the full report.
    const textToAnalyze = report.content_snapshot || report.description || "";
    if (textToAnalyze) {
      analyzeText(textToAnalyze).then((result) => {
        if (!cancelled) setAiResult(result);
      });
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.id]);

  return (
    <div className="bg-slate-800 p-3 rounded-lg mb-2">
      <div className="text-white">{report.reason}</div>
      <div className="text-slate-400 text-sm">{report.description}</div>

      {loading && (
        <div className="text-slate-500 text-xs mt-2">Analyzing...</div>
      )}
      <AIModerationBadge result={aiResult} />

      <button
        onClick={() => onResolve(report)}
        className="mt-3 bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-white text-sm"
      >
        Resolve
      </button>
    </div>
  );
}
