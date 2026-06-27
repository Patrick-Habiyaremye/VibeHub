// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../supabaseClient";
// import AvatarUpload from "../components/AvatarUpload";
// import { useAuth } from "../context/AuthContext";

// export default function Onboarding() {
//     const {
//     user,
//     loading: authLoading,
//   } = useAuth();
// console.log("AUTH USER:", user);
// console.log("AUTH LOADING:", authLoading);

//   const [username, setUsername] = useState("");
//   const [fullName, setFullName] = useState("");
//   const [avatarUrl, setAvatarUrl] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [bio, setBio] = useState("");

//   const navigate = useNavigate();
//   if (authLoading) {
//   return (
//     <div className="min-h-screen flex items-center justify-center text-white">
//       Loading user...
//     </div>
//   );
// }

// if (!user) {
//   return (
//     <div className="min-h-screen flex items-center justify-center text-white">
//       No authenticated user found.
//     </div>
//   );
// }

//   const progress =
//     (avatarUrl ? 33 : 0) +
//     (username ? 33 : 0) +
//     (fullName ? 34 : 0);

//   const handleFinish = async () => {
//     try {
//       setLoading(true);

//       if (!user) throw new Error("No user found");

// const { data, error } = await supabase
//   .from("profiles")
//   .upsert({
//     id: user.id,
//     username,
//     full_name: fullName,
//     avatar_url: avatarUrl,
//     bio: "",
//   })
//   .select()
//   .single();

//       if (error) throw error;

//       navigate("/feed");
//     } catch (err) {
//       console.error(err);
//       alert(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
//       <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-xl p-8">

//         {/* Header */}
//         <div className="text-center mb-6">
//           <h1 className="text-3xl font-bold">
//             Welcome to VibeHub 🎉
//           </h1>

//           <p className="text-slate-400 mt-2">
//             Complete your profile to continue
//           </p>
//         </div>

//         {/* Progress Bar */}
//         <div className="mb-6">
//           <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
//             <div
//               className="h-full bg-yellow-500 transition-all duration-500"
//               style={{ width: `${progress}%` }}
//             />
//           </div>

//           <p className="text-xs text-slate-400 mt-2">
//             Profile Completion: {progress}%
//           </p>
//         </div>

//         {/* Avatar Upload */}
//         <div className="flex justify-center mb-6">
//           <AvatarUpload
//             user={user}
//             onUpload={(url) => setAvatarUrl(url)}
//           />
//         </div>

//         {/* Username */}
//         <div className="mb-4">
//           <label className="block mb-2 text-sm">
//             Username
//           </label>

//           <input
//             type="text"
//             placeholder="Username"
//             value={username}
//             onChange={(e) =>
//               setUsername(
//                 e.target.value
//                   .toLowerCase()
//                   .replace(/\s/g, "")
//               )
//             }
//             className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-yellow-500"
//           />
//         </div>

//         {/* Full Name */}
//         <div className="mb-6">
//           <label className="block mb-2 text-sm">
//             Full Name
//           </label>

//           <input
//             type="text"
//             placeholder="Full Name"
//             value={fullName}
//             onChange={(e) =>
//               setFullName(e.target.value)
//             }
//             className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-yellow-500"
//           />
//         </div>
//         <textarea
//   placeholder="Bio"
//   value={bio}
//   onChange={(e) => setBio(e.target.value)}
//   className="w-full p-3 rounded-lg bg-slate-800"
// />

//         {/* Live Preview */}
//         {(username || fullName) && (
//           <div className="bg-slate-800 p-4 rounded-lg mb-6">
//             <p className="text-sm text-slate-400">
//               Preview
//             </p>

//             <h3 className="font-bold">
//               {fullName || "Your Name"}
//             </h3>

//             <p className="text-yellow-400">
//               @{username || "username"}
//             </p>
//           </div>
//         )}

//         {/* Continue Button */}
//         <button
//           onClick={handleFinish}
//           disabled={
//             loading ||
//             !username ||
//             !fullName
//           }
//           className="w-full py-3 rounded-lg bg-yellow-500 text-black font-bold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
//         >
//           {loading
//             ? "Saving..."
//             : "Continue to Feed 🚀"}
//         </button>

//       </div>
//     </div>
//   );
// }

// 

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

  // 🔥 SAVE PROFILE
  const handleFinish = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        username: username.trim(),
        full_name: fullName.trim(),
        avatar_url: avatarUrl,
        bio: bio.trim(),
      });

      if (error) throw error;

      // 🔥 IMPORTANT: refresh page state by reloading route
      navigate("/feed");
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