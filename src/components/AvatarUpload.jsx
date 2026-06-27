// import { useState } from "react";
// import { supabase } from "../supabaseClient";

// export default function AvatarUpload({
//   user,
//   onUpload = () => {},
// }) {
//   console.log("🔥 AvatarUpload ACTIVE VERSION");

//   const [uploading, setUploading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");
//   const [avatarUrl, setAvatarUrl] = useState("");

//   const handleUpload = async (e) => {
//     try {
//       if (!user) return;

//       const file = e.target.files?.[0];
//       if (!file) return;

//       setUploading(true);
//       setErrorMsg("");

//       if (!file.type.startsWith("image/")) {
//         throw new Error("Please upload an image");
//       }

//       const fileExt = file.name.split(".").pop();
//       const filePath = `${user.id}/${Date.now()}.${fileExt}`;

//       const { error } = await supabase.storage
//         .from("avatars")
//         .upload(filePath, file, { upsert: true });

//       if (error) throw error;

//       const { data } = supabase.storage
//         .from("avatars")
//         .getPublicUrl(filePath);

//       const publicUrl = data.publicUrl;

//       setAvatarUrl(publicUrl);

//       onUpload?.(publicUrl);

//     } catch (err) {
//       console.error(err);
//       setErrorMsg(err.message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center">
//       <label className="cursor-pointer">
//         <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-500 flex items-center justify-center bg-slate-800">

//           {avatarUrl ? (
//             <img
//               src={avatarUrl}
//               className="w-full h-full object-cover"
//               alt="avatar"
//             />
//           ) : (
//             <span className="text-4xl">👤</span>
//           )}

//         </div>

//         <input
//           type="file"
//           hidden
//           accept="image/*"
//           onChange={handleUpload}
//         />
//       </label>

//       {uploading && <p>Uploading...</p>}
//       {errorMsg && <p className="text-red-500">{errorMsg}</p>}
//     </div>
//   );
// }

import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AvatarUpload({
  user,
  onUpload = () => {},
}) {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const handleUpload = async (e) => {
    try {
      if (!user) {
        throw new Error("You must be logged in.");
      }

      const file = e.target.files?.[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file.");
      }

      setUploading(true);
      setErrorMsg("");

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload image
      const { error: uploadError } =
        await supabase.storage
          .from("avatars")
          .upload(filePath, file, {
            upsert: true,
          });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Save to profiles table
      const { error: profileError } =
        await supabase
          .from("profiles")
          .update({
            avatar_url: publicUrl,
          })
          .eq("id", user.id);

      if (profileError) throw profileError;

      setAvatarUrl(publicUrl);

      // Send URL back to parent
      onUpload(publicUrl);

      console.log("Avatar uploaded:", publicUrl);

    } catch (error) {
      console.error(error);
      setErrorMsg(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">

      <label className="cursor-pointer">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-500 bg-slate-800 flex items-center justify-center">

          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-5xl">👤</span>
          )}

        </div>

        <input
          type="file"
          hidden
          accept="image/*"
          onChange={handleUpload}
        />
      </label>

      {uploading && (
        <p className="text-sm text-yellow-500">
          Uploading...
        </p>
      )}

      {errorMsg && (
        <p className="text-sm text-red-500">
          {errorMsg}
        </p>
      )}

    </div>
  );
}