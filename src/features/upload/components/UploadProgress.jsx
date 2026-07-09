export default function UploadProgress({ progress, uploading }) {
  if (!uploading) return null;

  return (
    <div className="w-full bg-gray-700 h-2 rounded">
      <div
        className="bg-yellow-500 h-2 rounded"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}