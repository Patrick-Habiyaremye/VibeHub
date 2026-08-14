import QuoteRenderer from "./QuoteRenderer";
import ImageRenderer from "./ImageRenderer";
import VideoRenderer from "./VideoRenderer";

/**
 * STRICT renderer
 * Assumes backend already normalized data
 */
export default function MediaRenderer({
  post,
  isActive = false,
  priority = false,
}) {
  if (!post) return null;

  const media = post.media;
  const type = media?.kind || null;

  //--------------------------------------------------
  // 🔥 HARD FAIL (DEV ONLY)
  //--------------------------------------------------

  if (!type) {
    if (import.meta.env.DEV) {
      console.warn("MediaRenderer: missing media.kind", post);
    }
    return null;
  }

  //--------------------------------------------------
  // RENDER
  //--------------------------------------------------

  switch (type) {
    case "quote": {
      return (
        <QuoteRenderer
          content={post.content}
          background={post.style?.background}
          emoji={post.style?.emoji}
        />
      );
    }

    case "image": {
      if (!media?.url) return null;

      return (
        <ImageRenderer
          src={media.url}
          alt={media.caption || ""}
        />
      );
    }

    case "video": {
      if (!media?.url) return null;

      return (
        <VideoRenderer
          src={media.url}
          poster={media.poster}
          isActive={isActive}
          priority={priority}
        />
      );
    }

    default: {
      if (import.meta.env.DEV) {
        console.warn("Unsupported media kind:", type, post);
      }
      return null;
    }
  }
}