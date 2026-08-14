import { useProfileContext } from "../context/ProfileContext";
import { PROFILE_TABS } from "../constants/profileTabs.constants";

export default function ProfileTabs() {
  const { activeTab, setActiveTab } = useProfileContext();

  return (
    <div className="flex border-b" role="tablist">
      {PROFILE_TABS.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={activeTab === tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`flex-1 py-4 font-semibold transition-colors ${
            activeTab === tab.key
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}