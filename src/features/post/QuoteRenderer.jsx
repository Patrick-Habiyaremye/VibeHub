// features/post/QuoteRenderer.jsx

// export default function QuoteRenderer({
//   content,
//   className = "",
// }) {
//   if (!content?.trim()) return null;

//   return (
//     <div
//       className={`
//         w-full h-full flex items-center justify-center text-center
//         ${className}
//       `}
//     >
//       <p
//         className="
//           max-w-3xl
//           whitespace-pre-wrap
//           break-words
//           text-center
//           text-2xl
//           md:text-3xl
//           lg:text-4xl
//           font-semibold
//           leading-relaxed
//           text-white
//         "
//       >
//         {content}
//       </p>
//     </div>
//   );
// }

// features/feed/QuoteRenderer.jsx
//
// The only place quote text is ever rendered inside a post. Renders the
// text exactly ONCE — no separate "preview line" above the styled block.
// If your feed previously showed the raw text in a header and then again
// in a big styled block (visible in the "Jesus is the way..." screenshot),
// that duplication came from a caller rendering both `post.text` directly
// AND this component. Callers should render post.text nowhere else.

export default function QuoteRenderer({ content, background, emoji }) {
  const bgStyle = background?.style || "linear-gradient(135deg, #1e293b, #0f172a)";
  const textColorClass = background?.textColor || "text-white";

  return (
    <div
      className={`w-full min-h-[220px] flex flex-col items-center justify-center text-center px-8 py-10 rounded-2xl ${textColorClass}`}
      style={{ background: bgStyle }}
    >
      {emoji && <div className="text-4xl mb-3">{emoji}</div>}
      <p className="text-2xl md:text-3xl font-bold leading-snug">{content}</p>
    </div>
  );
}