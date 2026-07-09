export default function ComposerAudience({ value, onChange }) {
  return (
    <div className="mt-3">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border p-2 rounded font-bold"
      >
        <option value="public">🌍 Public</option>
        <option value="My Supporters">👥 My Supporters</option>
        <option value="private">🔒 Only Me</option>
      </select>
    </div>
  );
}