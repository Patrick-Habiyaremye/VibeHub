import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import SettingsCard from "./SettingsCard";

const USERNAME_REGEX = /^[a-zA-Z0-9_.]+$/;

export default function ProfileSettings() {
  const { settings, updateSettings, saving } = useSettings();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [fieldError, setFieldError] = useState(null);

  useEffect(() => {
    if (!settings) return;
    setUsername(settings.username || "");
    setBio(settings.bio || "");
  }, [settings]);

  if (!settings) return null;

  const validate = () => {
    if (!username.trim()) return "Username is required.";
    if (username.length < 3) return "Username must be at least 3 characters.";
    if (username.length > 20) return "Username must be 20 characters or fewer.";
    if (!USERNAME_REGEX.test(username)) return "Only letters, numbers, underscores, and periods.";
    if (bio.length > 160) return "Bio must be 160 characters or fewer.";
    return null;
  };

  const hasChanged = username !== settings.username || bio !== settings.bio;

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setFieldError(validationError);
      return;
    }
    setFieldError(null);
    await updateSettings({ username, bio });
  };

  return (
    <SettingsCard icon={User} title="Profile" description="How others see you across the app">
      <label className="block text-xs font-medium text-slate-400 mb-1.5">Username</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full mb-1 p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
        placeholder="Username"
        maxLength={20}
      />
      <p className="text-xs text-slate-600 mb-4 text-right">{username.length}/20</p>

      <label className="block text-xs font-medium text-slate-400 mb-1.5">Bio</label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={3}
        className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
        placeholder="Spreading positivity ✨"
        maxLength={160}
      />
      <p className="text-xs text-slate-600 mt-1 text-right">{bio.length}/160</p>

      {fieldError && <p className="text-red-400 text-xs mt-3">{fieldError}</p>}

      <button
        onClick={handleSave}
        disabled={!hasChanged || saving}
        className="mt-4 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </SettingsCard>
  );
}