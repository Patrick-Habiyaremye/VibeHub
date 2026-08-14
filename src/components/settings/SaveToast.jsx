import { useEffect, useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

export default function SaveToast() {
  const { saving, error, savedPulse } = useSettings();
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState("saved"); // "saved" | "error"

  useEffect(() => {
    if (savedPulse === 0) return;
    setMode("saved");
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(t);
  }, [savedPulse]);

  useEffect(() => {
    if (!error) return;
    setMode("error");
    setVisible(true);
  }, [error]);

  const show = visible || saving;

  return (
    <div
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-50 transition-all duration-300 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      <div
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium border ${
          mode === "error"
            ? "bg-red-950 border-red-800 text-red-300"
            : "bg-slate-800 border-slate-700 text-slate-100"
        }`}
      >
        {saving ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            Saving…
          </>
        ) : mode === "error" ? (
          <>
            <AlertCircle size={16} className="text-red-400" />
            {error}
          </>
        ) : (
          <>
            <Check size={16} className="text-green-400" />
            Changes saved
          </>
        )}
      </div>
    </div>
  );
}