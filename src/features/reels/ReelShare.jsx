// features/reels/ReelShare.jsx
//
// Carried over unchanged — no bugs found.

import { useState, useCallback } from "react";
import { Share2, Link as LinkIcon, Check } from "lucide-react";

export default function ReelShare({ reelId, title = "Check this reel", caption = "" }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const shareUrl = `${window.location.origin}/reel/${reelId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleShare = useCallback(async () => {
    if (loading) return;

    try {
      setLoading(true);

      if (navigator.share) {
        await navigator.share({ title, text: caption, url: shareUrl });
      } else {
        await copyToClipboard();
      }
    } catch (err) {
      console.warn("Share failed or canceled", err);
      await copyToClipboard();
    } finally {
      setLoading(false);
    }
  }, [loading, shareUrl, title, caption]);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleShare}
        disabled={loading}
        aria-label="Share reel"
        className="text-white p-3 rounded-full bg-black/40 hover:bg-black/60 transition disabled:opacity-50"
      >
        <Share2 size={20} />
      </button>

      <button
        onClick={copyToClipboard}
        className="flex items-center gap-1 text-xs text-gray-300 hover:text-white transition"
      >
        {copied ? (
          <>
            <Check size={14} /> Copied
          </>
        ) : (
          <>
            <LinkIcon size={14} /> Copy
          </>
        )}
      </button>
    </div>
  );
}