import { Loader2 } from "lucide-react";
import { useProfileContext } from "../context/ProfileContext";
import { useProfileActivity } from "../hooks/useProfileActivity";
import ProfileEmpty from "./ProfileEmpty";

export default function ProfileActivity() {
  const { userId, activeTab } = useProfileContext();
  const { groups, loading, error } = useProfileActivity(userId, { enabled: activeTab === "Activity" });

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin text-purple-600" size={24} />
      </div>
    );
  }

  if (error) return <ProfileEmpty message={error} />;
  if (groups.length === 0) return <ProfileEmpty message="Activity coming soon." />;

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.day}>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{group.day}</p>
          <div className="space-y-2">
            {group.items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-sm text-gray-700">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}