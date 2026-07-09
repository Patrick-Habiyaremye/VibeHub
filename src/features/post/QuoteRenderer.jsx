// features/post/QuoteRenderer.jsx

export default function QuoteRenderer({
  content,
  className = "",
}) {
  if (!content?.trim()) return null;

  return (
    <div
      className={`
        w-full h-full flex items-center justify-center text-center
        ${className}
      `}
    >
      <p
        className="
          max-w-3xl
          whitespace-pre-wrap
          break-words
          text-center
          text-2xl
          md:text-3xl
          lg:text-4xl
          font-semibold
          leading-relaxed
          text-white
        "
      >
        {content}
      </p>
    </div>
  );
}