// src/components/post/card/CardHeader.jsx — one line changes
//
// FIX: post.profiles -> post.user. normalizePost() has always produced
// `user` as the canonical author field (see its own header comment: "one
// canonical frontend author representation... Preferred: post.user").
// `post.profiles` was never populated by anything — this line is the
// entire "Unknown User" bug (§13/TEST 9). No other consumer of this
// object needed to change since CardAuthor already receives it as an
// opaque `profile` prop.

import { memo, useCallback } from "react";
import CardAuthor from "./CardAuthor";
import CardTimestamp from "./CardTimestamp";
import CardMenu from "./CardMenu";

function CardHeader({
  post,
  canDelete = false,
  onDelete,
  onSave,
  onReport,
}) {
  if (!post) return null;

  const author = post.user ?? {};

  const handleDelete = useCallback(() => {
    onDelete?.(post.id);
  }, [onDelete, post.id]);

  const handleSave = useCallback(() => {
    onSave?.(post.id);
  }, [onSave, post.id]);

  const handleReport = useCallback(() => {
    onReport?.(post.id);
  }, [onReport, post.id]);

  const showMenu = canDelete || onSave || onReport;

  return (
    <header
      className="flex items-start justify-between gap-4 p-4"
      role="group"
      aria-label="Post header"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <CardAuthor
          profile={author}
          // SCHEMA VERIFICATION REQUIRED — normalizePost() has no
          // `verified`/`supporter` fields; these currently always
          // evaluate false until that's confirmed as a real column and
          // wired through normalizePost.
          showVerified={Boolean(author?.verified)}
          showSupporter={Boolean(author?.supporter)}
        />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <CardTimestamp date={post.created_at} />

        {showMenu && (
          <CardMenu
            postId={post.id}
            canDelete={canDelete}
            onDelete={handleDelete}
            onSave={handleSave}
            onReport={handleReport}
          />
        )}
      </div>
    </header>
  );
}

export default memo(CardHeader);