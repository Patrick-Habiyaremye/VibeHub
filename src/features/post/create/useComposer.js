// features/create/useComposer.jsx
import { useState } from "react";
import { buildDraft } from "../utils/buildDraft";
import { ComposerEngine } from "../engine/ComposerEngine";

export function useComposer({ createPost, currentUserId }) {
  const engine = new ComposerEngine({ createPost });

  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [background, setBackground] = useState(null);
  const [audience, setAudience] = useState("public");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ---------------- ACTIONS ---------------- */

  const attachMedia = (file, type) => {
    setMedia(file);
    setMediaType(type);
    setBackground(null);
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaType(null);
  };

  const submit = async () => {
    setError(null);

    try {
      const draft = buildDraft({
        content,
        media,
        mediaType,
        background,
        audience,
        currentUserId,
      });

      setLoading(true);

      await engine.submit(draft);

      // reset UI state
      setContent("");
      setMedia(null);
      setMediaType(null);
      setBackground(null);
      setAudience("public");

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return {
    // state
    content,
    media,
    mediaType,
    background,
    audience,
    loading,
    error,

    // setters
    setContent,
    setBackground,
    setAudience,

    // actions
    attachMedia,
    removeMedia,
    submit,
  };
}