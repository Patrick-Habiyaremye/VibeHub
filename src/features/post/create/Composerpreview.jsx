export default function ComposerPreview({ content }) {
  if (!content) return null;

  return (
    <div className="mt-3 p-3 border rounded-lg bg-gray-50">
      <p>{content}</p>
    </div>
  );
}