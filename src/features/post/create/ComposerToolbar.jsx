export default function ComposerToolbar({ onMediaSelect }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) onMediaSelect(file);
  };

  return (
    <div className="flex gap-3 my-3">
      <label className="cursor-pointer text-blue-500">
        📷 Photo/Video
        <input type="file" hidden onChange={handleFile} />
      </label>
    </div>
  );
}