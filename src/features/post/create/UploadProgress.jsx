export default function UploadProgress({ progress }) {
  if (progress <= 0 || progress >= 100) return null;

  return (
    <div className="mt-2">
      <div className="w-full bg-gray-200 h-2 rounded">
        <div
          className="bg-blue-500 h-2 rounded"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs mt-1">{progress}% uploading...</p>
    </div>
  );
}