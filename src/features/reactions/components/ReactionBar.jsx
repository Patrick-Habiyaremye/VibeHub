// FILE: src/features/reactions/components/ReactionBar.jsx

import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import useReactions from "../hooks/useReactions";
import ReactionSummary from "./ReactionSummary";
import ReactionButton from "./ReactionButton";
import ReactionDetails from "./ReactionDetails";

/**
 * Owns all reaction UI + state for a post. ContentCard should not
 * duplicate any of this logic — it only renders <ReactionBar post={post} />.
 */
export default function ReactionBar({ post }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const {
    total,
    counts,
    userReaction,
    loading,
    react,
    breakdownLoading,
    loadBreakdown,
  } = useReactions(post?.id, { initialTotal: post?.smile_score ?? 0 });

  if (!post?.id) return null;

  const handleReact = (type) => {
    if (!user) {
      navigate("/login");
      return;
    }
    react(type);
  };

  const openDetails = () => {
    setDetailsOpen(true);
    loadBreakdown();
  };

  return (
    <div className="relative flex items-center justify-between">
      <ReactionSummary total={total} onClick={openDetails} />
      <ReactionButton
        userReaction={userReaction}
        onReact={handleReact}
        disabled={loading}
      />

      {detailsOpen && (
        <ReactionDetails
          total={total}
          counts={counts}
          loading={breakdownLoading}
          onClose={() => setDetailsOpen(false)}
        />
      )}
    </div>
  );
}