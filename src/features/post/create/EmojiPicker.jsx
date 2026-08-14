// const emojis = ["😀", "😂", "😍", "🔥", "👍"];

// export default function EmojiPicker({ onSelect }) {
//   return (
//     <div className="flex gap-2 p-2 border rounded">
//       {emojis.map((e) => (
//         <button key={e} onClick={() => onSelect(e)}>
//           {e}
//         </button>
//       ))}
//     </div>
//   );
// }

// import EmojiPicker from "emoji-picker-react";

// export default function EmojiPopover({ onSelect }) {
//   return (
//     <div className="absolute bottom-14 left-0 z-50">
//       <EmojiPicker
//         onEmojiClick={(emojiData) => {
//           onSelect(emojiData.emoji);
//         }}
//         theme="dark"
//         lazyLoadEmojis
//       />
//     </div>
//   );
// }