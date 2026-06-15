import { useState } from "react";
import { Image, Video, Send, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient";

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();

  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLoggedIn = !!user;

  // 🔐 BLOCK IF NOT LOGGED IN
  const requireAuth = () => {
    if (!isLoggedIn) {
      setShowAuthPrompt(true);
      return false;
    }
    return true;
  };

  // 📤 CREATE POST
  const handlePost = async () => {
    if (!requireAuth()) return;
    if (!content.trim()) return;

    try {
      setLoading(true);
      setError("");

      const { error: insertError } = await supabase.from("posts").insert({
        content: content.trim(),
        user_id: user.id,
      });

      if (insertError) {
        console.error(insertError);
        setError(insertError.message);
        return;
      }

      setContent("");
      setFile(null);

      if (onPostCreated) {
        onPostCreated(); // refresh feed
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while posting");
    } finally {
      setLoading(false);
    }
  };

  // 📎 FILE HANDLER
  const handleFileChange = (e) => {
    if (!requireAuth()) return;
    setFile(e.target.files[0]);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6">

      {/* AUTH WARNING */}
      {showAuthPrompt && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-300 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={18} />
            Please sign in to create a post
          </div>

          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Sign In
          </button>
        </div>
      )}

      {/* POST ERROR */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* TEXT AREA */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          isLoggedIn
            ? "What's making you smile today? 😊"
            : "Sign in to share your thoughts..."
        }
        disabled={!isLoggedIn}
        className="w-full bg-slate-900 rounded-lg p-3 text-white resize-none outline-none disabled:opacity-50"
        rows="4"
      />

      {/* FILE PREVIEW */}
      {file && (
        <div className="mt-2 text-sm text-slate-300">
          📎 {file.name}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex justify-between items-center mt-4">

        {/* FILE INPUTS */}
        <div className="flex gap-4">

          <label className={`flex items-center gap-2 ${isLoggedIn ? "text-slate-300 cursor-pointer" : "text-slate-600"}`}>
            <Image size={18} />
            Photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={!isLoggedIn}
            />
          </label>

          <label className={`flex items-center gap-2 ${isLoggedIn ? "text-slate-300 cursor-pointer" : "text-slate-600"}`}>
            <Video size={18} />
            Video
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={!isLoggedIn}
            />
          </label>

        </div>

        {/* POST BUTTON */}
        <button
          onClick={handlePost}
          disabled={!content && !file || loading}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-40 text-black px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Send size={18} />
          {loading ? "Posting..." : "Share"}
        </button>

      </div>
    </div>
  );
}