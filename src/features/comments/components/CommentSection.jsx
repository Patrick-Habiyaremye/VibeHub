// src/features/comments/components/CommentSection.jsx
//
// Public entry point. currentUser is NO LONGER a prop — CommentProvider
// pulls it from useAuth() internally. ownerId (the content's author) IS
// still required, since it can't be derived from auth.

// src/features/comments/components/CommentSection.jsx
//
// variant="sheet" (default): mobile swipe-up modal, as before.
// variant="panel": no modal chrome — fills its parent's height, meant for
// a persistent sidebar embed (see ReelCommentsPanel.jsx). onClose is
// optional in panel mode since there's nothing to dismiss.

import { CommentProvider } from "../context/CommentContext";
import ConversationSheet from "./ConversationSheet";
import CommentList from "./CommentList";

export default function CommentSection({ contentType, contentId, ownerId, onClose, variant = "sheet" }) {
  return (
    <CommentProvider contentType={contentType} contentId={contentId} ownerId={ownerId}>
      {variant === "panel" ? (
        <div className="flex flex-col h-full">
          <CommentList onClose={onClose} />
        </div>
      ) : (
        <ConversationSheet onClose={onClose}>
          <CommentList onClose={onClose} />
        </ConversationSheet>
      )}
    </CommentProvider>
  );
}