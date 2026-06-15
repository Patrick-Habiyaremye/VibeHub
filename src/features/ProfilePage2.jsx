import { useState } from "react";
import { Lock } from "lucide-react";

export default function ProfilePage2({ user }) {
  const [profile] = useState({
    name: "Pacifique",
    username: "@pacifique",
    bio: "Building positive vibes only 🌟",
    coverImage: "https://images.unsplash.com/photo-1520975916090-3105956dac38",
    avatar: "https://i.pravatar.cc/150?img=12",

    kindnessScore: 82,
    smileCount: 134,
    gratitudeReceived: 48,

    challengeStreak: 6,
    totalChallengesCompleted: 21,

    achievements: [
      "First Kind Comment",
      "7-Day Challenge Streak",
      "Positive Energy Builder",
    ],
  });

  const isLoggedIn = !!user;

  // 🚫 BLOCK ACCESS IF NOT LOGGED IN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="bg-white p-8 rounded-xl shadow text-center max-w-md">
          <Lock className="mx-auto mb-3 text-gray-500" size={40} />

          <h2 className="text-xl font-bold mb-2">
            Login Required
          </h2>

          <p className="text-gray-600 mb-4">
            You need to sign in to view profiles on VibeHub.
          </p>

          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* COVER */}
      <div className="relative h-64">
        <img
          src={profile.coverImage}
          className="w-full h-full object-cover"
          alt="cover"
        />

        <div className="absolute -bottom-12 left-6 flex items-end gap-4">
          <img
            src={profile.avatar}
            className="w-24 h-24 rounded-full border-4 border-white"
            alt="avatar"
          />

          <div className="mb-2">
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-gray-600">{profile.username}</p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="mt-16 max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="space-y-4">

          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-gray-600">{profile.bio}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-2">🏆 Achievements</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {profile.achievements.map((a, i) => (
                <li key={i}>• {a}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT */}
        <div className="md:col-span-2 space-y-6">

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">
              😊 Kindness Score
            </h3>
            <div className="text-4xl font-bold text-purple-600">
              {profile.kindnessScore}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <StatCard title="😊 Smiles" value={profile.smileCount} />
            <StatCard title="💛 Gratitude" value={profile.gratitudeReceived} />
            <StatCard title="🌟 Streak" value={`${profile.challengeStreak} days`} />
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