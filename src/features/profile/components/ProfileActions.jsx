import { Link } from "react-router-dom";
import { Edit } from "lucide-react";
import { useProfileContext } from "../context/ProfileContext";

export default function ProfileActions() {
  const { isOwnProfile } = useProfileContext();
  if (!isOwnProfile) return null;

  return (
    <Link to="/settings" className="shrink-0">
      <button className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-xl hover:bg-purple-700 transition-colors">
        <Edit size={18} />
        Edit Profile
      </button>
    </Link>
  );
}