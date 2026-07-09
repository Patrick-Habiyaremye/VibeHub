import { useState } from "react";
import { Lock } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { ContentApi } from "../../api/contentApi";

import ComposerHeader from "./ComposerHeader";
import ComposerTextarea from "./ComposerTextarea";
import ComposerToolbar from "./ComposerToolbar";
import ComposerPreview from "./ComposerPreview";
import ComposerMediaPreview from "./ComposerMediaPreview";
import ComposerAudience from "./ComposerAudience";
import ComposerFooter from "./ComposerFooter";
import UploadProgress from "./UploadProgress";

import { useCreatePost } from "./useCreatePost";
import { useDraft } from "./useDraft";

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();

  const isLoggedIn = !!user;

  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [audience, setAudience] = useState("public");

  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // 🔥 hooks (logic layer)
  const {
    submit,
    loading,
    error,
    progress,
    uploading,
  } = useCreatePost({
    api: {
      createPost: ContentApi.createPost,
      uploadMedia: ContentApi.uploadMedia,
    },
    onSuccess: onPostCreated,
  });

  useDraft({
    content,
    file,
    setContent,
    setFile,
  });

  // 🔐 auth guard (preserved from your original)
  const requireAuth = () => {
    if (!isLoggedIn) {
      setShowAuthPrompt(true);
      return false;
    }
    return true;
  };

  // 📁 media handler
  const handleMediaSelect = (selectedFile, type) => {
    if (!requireAuth()) return;

    if (!selectedFile) return;

    setFile(selectedFile);
    setMediaType(type);
  };

  // 🚀 submit handler
  const handleSubmit = async () => {
    if (!requireAuth()) return;

    if (!content.trim() && !file) return;

    await submit({
      content: content.trim(),
      file,
      type: file ? mediaType : "quote",
      audience,
    });

    // reset AFTER submit success path handled in hook
    setContent("");
    setFile(null);
    setMediaType(null);
    setAudience("public");
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6">
      
      {/* 🔐 AUTH WARNING */}
      {showAuthPrompt && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-300 rounded-lg">
          <div className="flex items-center gap-2">
            <Lock size={18} />
            Please sign in first
          </div>
        </div>
      )}

      {/* ❌ ERROR */}
      {error && (
        <div className="text-red-400 mb-3">
          {error}
        </div>
      )}

      {/* 🧠 HEADER */}
      <ComposerHeader user={user} />

      {/* ✍️ TEXT */}
      <ComposerTextarea
        value={content}
        onChange={setContent}
        disabled={!isLoggedIn}
      />

      {/* 🧰 TOOLBAR */}
      <ComposerToolbar
        disabled={!isLoggedIn}
        onMediaSelect={(file, type) =>
          handleMediaSelect(file, type)
        }
      />

      {/* 🖼 MEDIA PREVIEW */}
      <ComposerMediaPreview
        media={file}
        onRemove={() => setFile(null)}
      />

      {/* 📊 UPLOAD PROGRESS */}
      <UploadProgress progress={progress} />

      {/* 👁 CONTENT PREVIEW */}
      <ComposerPreview content={content} />

      {/* 🌍 AUDIENCE */}
      <ComposerAudience
        value={audience}
        onChange={setAudience}
      />

      {/* 🚀 FOOTER */}
      <ComposerFooter
        onSubmit={handleSubmit}
        loading={loading || uploading}
        disabled={
          !isLoggedIn ||
          (!content.trim() && !file)
        }
      />
    </div>
  );
}