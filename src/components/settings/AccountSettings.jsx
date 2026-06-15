import { useState, useEffect } from "react";

export default function AccountSetting() {
  const [settings, setSettings] = useState({
    smileVisibility: true,
    gratitudeMessages: true,
    dailyChallenges: true,
    positiveContentOnly: true,
  });

  // Toggle handler
  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // TODO: replace with Supabase save
  const saveSettings = async () => {
    console.log("Saving settings:", settings);
    // await supabase.from("profiles").update(settings).eq("id", user.id)
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">VibeHub Settings</h2>

      {/* Smile Visibility */}
      <SettingItem
        title="😊 Smile Visibility"
        description="Show my kindness score"
        value={settings.smileVisibility}
        onChange={() => handleToggle("smileVisibility")}
      />

      {/* Gratitude Messages */}
      <SettingItem
        title="💛 Gratitude Messages"
        description="Allow people to thank me"
        value={settings.gratitudeMessages}
        onChange={() => handleToggle("gratitudeMessages")}
      />

      {/* Daily Challenges */}
      <SettingItem
        title="🌟 Daily Challenge Reminders"
        description="Receive challenge reminders"
        value={settings.dailyChallenges}
        onChange={() => handleToggle("dailyChallenges")}
      />

      {/* Positive Content */}
      <SettingItem
        title="🙌 Positive Content Only"
        description="Hide reported toxic content"
        value={settings.positiveContentOnly}
        onChange={() => handleToggle("positiveContentOnly")}
      />

      <button
        onClick={saveSettings}
        className="mt-6 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
      >
        Save Changes
      </button>
    </div>
  );
}

// Reusable component
function SettingItem({ title, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-4 border-b">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <button
        onClick={onChange}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
          value ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow transform transition ${
            value ? "translate-x-6" : ""
          }`}
        />
      </button>
    </div>
  );
}