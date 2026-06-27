// features/post/CommentDrawer.jsx

import CommentSection
from "./CommentSection";

export default function CommentDrawer({

  open,

  onClose,

  postId,

}) {

  if (!open) return null;

  return (

    <div
      className="
        fixed
        inset-0
        z-50
        bg-black/60
        flex
        justify-end
      "
    >

      <div
        className="
          w-full
          md:w-[450px]
          h-full
          bg-slate-900
          border-l
          border-slate-700
          overflow-y-auto
          p-4
        "
      >

        <div
          className="
            flex
            justify-between
            items-center
            mb-4
          "
        >

          <h2
            className="
              text-white
              text-xl
              font-bold
            "
          >
            Comments
          </h2>

          <button
            onClick={onClose}
            className="
              text-slate-400
              hover:text-white
            "
          >
            ✕
          </button>

        </div>

        <CommentSection
          postId={postId}
        />

      </div>

    </div>

  );

}