import { Lock } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import SettingsCard from "./SettingsCard";
import Toggle from "./Toggle";

export default function PrivacySettings() {
  const { settings, updateSettings } = useSettings();
  if (!settings) return null;

  const toggle = (key) => updateSettings({ [key]: !settings[key] }, { debounce: true });

  return (
    <SettingsCard icon={Lock} title="Privacy" description="Control who sees your activity">
      <div className="divide-y divide-slate-700/50">
        <Toggle
          checked={!!settings.is_private}
          onChange={() => toggle("is_private")}
          label="Private profile"
          description="Only approved supporters can see your posts"
        />
        <Toggle
          checked={!!settings.hide_activity}
          onChange={() => toggle("hide_activity")}
          label="Hide activity status"
          description="Others won't see when you're online"
        />
      </div>
    </SettingsCard>
  );
}