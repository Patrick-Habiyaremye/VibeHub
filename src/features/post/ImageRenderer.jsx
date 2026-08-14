// features/post/ImageRenderer.jsx

import { useState } from "react";

export default function ImageRenderer({
  src,
  alt = "Post image",
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src) return null;

  return (
    <div className="w-full h-full relative bg-black overflow-hidden">
      {/* SKELETON */}
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-slate-800" />
      )}

      {/* ERROR */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
          Failed to load image
        </div>
      )}

      {/* IMAGE */}
      {!error && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(true);
            setError(true);
          }}
          className={`
            w-full
            h-full
            object-contain
            transition-opacity
            duration-300
            ${loaded ? "opacity-100" : "opacity-0"}
          `}
        />
      )}
    </div>
  );
}