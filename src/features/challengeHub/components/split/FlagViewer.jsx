// src/features/challengeHub/components/FlagViewer.jsx

import { useState } from "react";

export default function FlagViewer({
  src,
  alt = "Flag",
  country,
  loading = false,
}) {
  const [error, setError] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-48 w-72 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (!src || error) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-500">
        Flag unavailable
      </div>
    );
  }

  return (
    <figure className="flex flex-col items-center gap-4 py-6">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setError(true)}
        className="max-h-56 w-auto rounded-xl border bg-white shadow-lg"
      />

      {country && (
        <figcaption className="text-sm text-gray-500">
          {country}
        </figcaption>
      )}
    </figure>
  );
}