// 

import { useAuth } from "../../context/AuthContext";

import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostMedia from "./PostMedia";
import SmileMeter from "./SmileMeter";
import ReactionBar from "./ReactionBar";
import CommentSection from "./CommentSection";
import { useNavigate } from "react-router-dom";

export default function PostCard({ post }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!post) return null;

  return (
    <article className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6 transition hover:border-yellow-500/30">

      <PostHeader
        profile={post.profiles}
        createdAt={post.created_at}
      />

      <PostContent content={post.content} />

      <PostMedia post={post} />

      <SmileMeter postId={post.id} />

      {/* AUTH GATED AREA */}
      {user ? (
        <>
          <ReactionBar post={post} />
          <CommentSection postId={post.id} />
        </>
      ) : (
        <div className="mt-5 border-t border-slate-700 pt-4">
          <p className="text-slate-400 text-sm mb-2">
            Join to react, comment and spread kindness 💛
          </p>

          <button
            onClick={() => navigate("/login")}
            className="text-yellow-400 hover:underline text-sm"
          >
            Sign in to continue →
          </button>
        </div>
      )}
    </article>
  );
}