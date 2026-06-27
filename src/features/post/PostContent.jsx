// features/post/PostContent.jsx

export default function PostContent({
  content,
}) {

  if (!content) return null;

  return (

    <div className="mt-4">

      <p
        className="
          text-slate-200
          whitespace-pre-wrap
          leading-relaxed
        "
      >
        {content}
      </p>

    </div>

  );

}