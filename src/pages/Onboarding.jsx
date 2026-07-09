import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import AvatarUpload from "../components/AvatarUpload";
import { useAuth } from "../context/AuthContext";

export default function Onboarding() {
const {
  user,
  profile,
  authLoading,
  profileLoading,
  reloadProfile,
} = useAuth();

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 SYNC EXISTING PROFILE (important for edit cases)
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setFullName(profile.full_name || "");
      setAvatarUrl(profile.avatar_url || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  // 🔥 WAIT FOR AUTH SYSTEM (prevents blank screen)
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  // 🔴 SAFETY CHECK (should rarely trigger because ProtectedRoute handles it)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        No authenticated user found
      </div>
    );
  }

  const progress =
    (username ? 25 : 0) +
    (fullName ? 25 : 0) +
    (avatarUrl ? 25 : 0) +
    (bio ? 25 : 0);


const handleFinish = async () => {
  try {
    setLoading(true);

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      username: username.trim(),
      full_name: fullName.trim(),
      avatar_url: avatarUrl,
      bio: bio.trim(),
      is_onboarded: true,
    });

    if (error) throw error;

    // 🔥 THIS IS THE IMPORTANT PART
    await reloadProfile();

    navigate("/feed", { replace: true });

  } catch (err) {
    console.error(err);
    alert(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-xl p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">
            Complete Your Profile
          </h1>
          <p className="text-slate-400 mt-2">
            Finish setup to continue
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <AvatarUpload
            user={user}
            onUpload={(url) => setAvatarUrl(url)}
          />
        </div>

        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(
              e.target.value.toLowerCase().replace(/\s/g, "")
            )
          }
          className="w-full p-3 mb-4 rounded-lg bg-slate-800"
        />

        {/* Full Name */}
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-slate-800"
        />

        {/* Bio */}
        <textarea
          placeholder="Write your bio..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-3 mb-6 rounded-lg bg-slate-800"
        />

        {/* Continue */}
        <button
          onClick={handleFinish}
          disabled={loading || !username || !fullName}
          className="w-full py-3 rounded-lg bg-yellow-500 text-black font-bold disabled:opacity-50"
        >
          {loading ? "Saving..." : "Continue to Feed 🚀"}
        </button>
      </div>
    </div>
  );
}