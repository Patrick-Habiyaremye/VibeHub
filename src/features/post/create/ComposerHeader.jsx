import { useAuth } from "../../../context/AuthContext";

export default function ComposerHeader() {
  const { profile } = useAuth();

  return (
    <div className="flex items-center gap-3 mb-3">
      <img
        src={
          profile?.avatar_url ||
          "/default-avatar.png"
        }
        alt={profile?.username || "User"}
        className="w-10 h-10 rounded-full object-cover border border-slate-700"
      />

      <div>
        <p className="font-semibold text-white">
          {profile?.full_name ||
            profile?.username ||
            "You"}
        </p>

        <span className="text-xs text-slate-400">
          Create a positive post ✨
        </span>
      </div>
    </div>
  );
}