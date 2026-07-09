export default function ComposerFooter({ onSubmit }) {
  return (
    <div className="mt-4 flex justify-end">
      <button
        onClick={onSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        Post
      </button>
    </div>
  );
}