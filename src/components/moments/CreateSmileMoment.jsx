import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function CreateSmileMoment({ user }) {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);

  const uploadMoment = async () => {
    let media_url = null;
    let media_type = "text";

    if (file) {
      const fileName = `${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("moments")
        .upload(fileName, file);

      if (error) return console.error(error);

      const { data } = supabase.storage
        .from("moments")
        .getPublicUrl(fileName);

      media_url = data.publicUrl;
      media_type = file.type.startsWith("video") ? "video" : "image";
    }

    await supabase.from("smile_moments").insert({
      user_id: user.id,
      caption,
      media_url,
      media_type,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    setCaption("");
    setFile(null);
  };

  return (
    <div className="p-3 bg-slate-900 rounded-xl">
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Share a smile moment..."
        className="w-full p-2 bg-slate-800 text-white rounded"
      />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mt-2 text-white"
      />

      <button
        onClick={uploadMoment}
        className="mt-2 bg-pink-500 px-4 py-1 rounded text-white"
      >
        Share
      </button>
    </div>
  );
}