import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import AvatarUpload from "../components/AvatarUpload";

export default function ProfilePage2({onUpload}) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  const isLoggedIn = !!user;

  // 🚫 BLOCK ACCESS
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-white p-8 rounded-xl text-center">
          <Lock className="mx-auto mb-3" size={40} />
          <h2 className="text-xl font-bold">Login Required</h2>
          <button onClick={() => (window.location.href = "/login")}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // 🔥 FETCH REAL PROFILE
  useEffect(() => {
  async function loadProfile() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      alert("Failed to load profile");
      return;
    }

    if (!data) {
      // 🚨 create profile if missing
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert([{ id: user.id }])
        .select()
        .single();

      if (insertError) {
        console.error(insertError);
        return;
      }

      setProfile(newProfile);
    } else {
      setProfile(data);
    }
  }

  loadProfile();
}, [user]);

 if (!profile) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading profile...</p>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* COVER */}
      <div className="relative h-64">
        <img
          src={profile.cover_image || "https://picsum.photos/1200/400"}
          className="w-full h-full object-cover"
        />

        <div className="absolute -bottom-12 left-6 flex items-end gap-4">
          <div>
            <img src={profile.avatar_url || "https://i.pravatar.cc/150"}
            onError={(e) => (e.target.src = "https://i.pravatar.cc/150")}
            className="w-24 h-24 rounded-full border-4 border-white" />

            {/* 🔥 REAL UPLOAD */}
            {/* <AvatarUpload
              user={user}
              onUpload={(url) =>
                setProfile((prev) => ({
                  ...prev,
                  avatar_url: url,
                }))
              }
            /> */}
          </div>

          <div className="mb-2">
            <p className="text-gray-600">
              @{profile.username || "username"}
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="mt-16 max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-gray-600">
              {profile.bio || "No bio yet"}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">
              😊 Kindness Score
            </h3>
            <div className="text-4xl font-bold text-purple-600">
              {profile.kindness_score || 0}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <StatCard title="😊 Smiles" value={profile.smile_count || 0} />
            <StatCard title="💛 Gratitude" value={profile.gratitude_received || 0} />
            <StatCard title="🌟 Streak" value={`${profile.streak || 0} days`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow text-center">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}