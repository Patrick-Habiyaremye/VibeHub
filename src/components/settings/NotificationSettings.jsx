import { Bell } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import SettingsCard from "./SettingsCard";
import Toggle from "./Toggle";

export default function NotificationSettings() {
  const { settings, updateSettings } = useSettings();
  if (!settings) return null;

  const toggle = (key) => updateSettings({ [key]: !settings[key] }, { debounce: true });

  return (
    <SettingsCard icon={Bell} title="Notifications" description="Choose what you hear about">
      <div className="divide-y divide-slate-700/50">
        <Toggle
          checked={!!settings.notify_likes}
          onChange={() => toggle("notify_likes")}
          label="Smile reactions"
          description="When someone smiles at your post"
        />
        <Toggle
          checked={!!settings.notify_comments}
          onChange={() => toggle("notify_comments")}
          label="Comments"
          description="When someone comments on your post"
        />
        <Toggle
          checked={!!settings.notify_messages}
          onChange={() => toggle("notify_messages")}
          label="Messages"
          description="When you receive a direct message"
        />
      </div>
    </SettingsCard>
  );
}