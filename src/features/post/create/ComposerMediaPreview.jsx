export default function ComposerMediaPreview({ media, onRemove }) {
  if (!media) return null;

  const url = URL.createObjectURL(media);

  return (
    <div className="relative mt-3">
      {media.type.startsWith("video") ? (
        <video src={url} controls className="rounded-lg" />
      ) : (
        <img src={url} alt="preview" className="rounded-lg" />
      )}

      <button
        onClick={onRemove}
        className="absolute top-2 right-2 bg-black text-white px-2 rounded"
      >
        ✕
      </button>
    </div>
  );
}