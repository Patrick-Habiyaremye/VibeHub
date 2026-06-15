import { useState } from "react";

export default function ProfileSettings() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  return (
    <div className="bg-slate-800 p-5 rounded-xl mb-6">

      <h2 className="text-xl text-white mb-4">
        Profile
      </h2>

      <input
        value={username}
        onChange={(e) =>
          setUsername(e.target.value)
        }
        placeholder="Username"
        className="w-full mb-3 p-3 rounded bg-slate-900 text-white"
      />

      <textarea
        value={bio}
        onChange={(e) =>
          setBio(e.target.value)
        }
        placeholder="Tell people about yourself..."
        className="w-full p-3 rounded bg-slate-900 text-white"
      />

      <button
        className="mt-4 bg-yellow-500 text-black px-4 py-2 rounded"
      >
        Save Profile
      </button>

    </div>
  );
}