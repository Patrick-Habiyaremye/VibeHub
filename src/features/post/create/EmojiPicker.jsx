const emojis = ["😀", "😂", "😍", "🔥", "👍"];

export default function EmojiPicker({ onSelect }) {
  return (
    <div className="flex gap-2 p-2 border rounded">
      {emojis.map((e) => (
        <button key={e} onClick={() => onSelect(e)}>
          {e}
        </button>
      ))}
    </div>
  );
}