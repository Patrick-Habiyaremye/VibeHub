// features/reels/ReelCommentsPanel.jsx
//
// Thin embed of the unified comments module (features/comments) for the
// desktop sidebar — no sheet chrome, no swipe-to-dismiss, just the list +
// composer filling the available height. `key={reel.id}` forces a clean
// remount when the active reel changes, so useComments()'s internal
// subscriptions/realtime channel for the PREVIOUS reel are properly torn
// down rather than trying to reuse a hook instance across a contentId
// change mid-flight.

// import { CommentSection } from "../comments";

// export default function ReelCommentsPanel({ reel }) {
//   if (!reel) return null;

//   return (
//     <div className="flex flex-col h-full w-full">
//       <CommentSection
//         key={reel.id}
//         contentType="reel"
//         contentId={reel.id}
//         ownerId={reel.user_id}
//         variant="panel"
//       />
//     </div>
//   );
// }






// features/reels/ReelCommentsPanel.jsx
//
// Adds a header (comment count + close button) around the shared
// CommentSection panel variant, since CommentList itself has no chrome.
// key={reel.id} still forces a clean remount on reel switch so
// useComments' realtime subscription for the PREVIOUS reel tears down
// instead of trying to reuse a hook instance across a contentId change.

import { X } from "lucide-react";
import { CommentSection } from "../comments";

export default function ReelCommentsPanel({ reel, onClose }) {
  if (!reel) return null;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 text-white shrink-0">
        <h2 className="font-semibold text-sm">
          Comments
          {typeof reel.commentsCount === "number" ? ` (${reel.commentsCount})` : ""}
        </h2>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comments"
            className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <CommentSection
          key={reel.id}
          contentType="reel"
          contentId={reel.id}
          ownerId={reel.user_id}
          variant="panel"
        />
      </div>
    </div>
  );
}