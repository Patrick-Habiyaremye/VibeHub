// export default function TypingIndicator({ typingUser }) {
//   if (!typingUser) return null;

//   return (
//     <div className="px-4 py-2 text-sm text-slate-400 italic">
//       {typingUser} is typing...
//       <span className="animate-pulse">...</span>
//     </div>
//   );
// }

export default function TypingIndicator({ typingUsers }) {
  if (!typingUsers?.length) return null;

  return (
    <div className="px-4 py-2 text-sm text-slate-400 italic">
      {typingUsers.length === 1
        ? `${typingUsers[0].user_id} is typing...`
        : `${typingUsers.length} people are typing...`}
    </div>
  );
}