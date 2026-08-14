import { useProfileContext } from "../context/ProfileContext";
import ProfileTabs from "./ProfileTabs";
import ProfilePosts from "./ProfilePosts";
import ProfileReels from "./ProfileReels";
import ProfileActivity from "./ProfileActivity";

export default function ProfileContent() {
  const { activeTab } = useProfileContext();

  return (
    <div className="mt-10 bg-white rounded-xl shadow">
      <ProfileTabs />
      <div className="p-6">
        {activeTab === "Posts" && <ProfilePosts />}
        {activeTab === "Reels" && <ProfileReels />}
        {activeTab === "Activity" && <ProfileActivity />}
      </div>
    </div>
  );
}