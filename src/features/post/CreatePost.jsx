// CreatePost.jsx
//
// Route-level entry point. Deliberately thin: its only job is to know
// *which* user is posting and *where* publishing sends data, then hand off
// to ComposerStudio. If you're tempted to add a hook or a piece of state
// here, it almost certainly belongs in useComposerSession instead.

import React from "react";
import ComposerStudio from "./create/studio/ComposerStudio";
import { ContentApi } from "../../api/contentApi"; // your real API facade (Supabase-backed)
import { useAuth } from "../../context/AuthContext";

export default function CreatePost({ onPublished, onCancel }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[240px]">
        <p className="text-[#232027]">Loading your account…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[240px]">
        <p className="text-[#232027]">Sign in to create a post.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-[#232027] flex items-center justify-center text-lg leading-none"
        onClick={onCancel}
        aria-label="Close"
      >
        ×
      </button>
      <ComposerStudio authorId={user.id} api={ContentApi} onPublished={onPublished} />
    </div>
  );
}