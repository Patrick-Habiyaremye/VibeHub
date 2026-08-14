import { Palette } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import SettingsCard from "./SettingsCard";

export default function AppearanceSettings() {
  const { settings, updateSettings } = useSettings();
  if (!settings) return null;

  const options = [
    { value: "dark", label: "Dark" },
    { value: "light", label: "Light" },
  ];

  return (
    <SettingsCard icon={Palette} title="Appearance" description="How the app looks on your screen">
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateSettings({ theme: opt.value }, { debounce: true })}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
              (settings.theme || "dark") === opt.value
                ? "bg-purple-600 border-purple-600 text-white"
                : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </SettingsCard>
  );
}