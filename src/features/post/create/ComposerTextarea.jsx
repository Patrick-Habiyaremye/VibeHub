export default function ComposerTextarea({ value, onChange }) {
  return (
    <textarea
      className="w-full resize-none outline-none text-lg"
      placeholder="What's on your mind?"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
    />
  );
}