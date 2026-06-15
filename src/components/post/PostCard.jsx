import ReactionBar from "./ReactionBar";
import CommentSection from "./CommentSection";

export default function PostCard({ post }) {

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">

      <div className="flex items-center gap-3">

        <img
          src={
            post.profiles?.avatar_url ||
            "https://ui-avatars.com/api/?name=User"
          }
          alt=""
          className="w-10 h-10 rounded-full object-cover"
        />

        <div>

          <h3 className="text-white font-semibold">
            {post.profiles?.username ||
              "Unknown User"}
          </h3>

          <p className="text-slate-400 text-sm">
            {new Date(
              post.created_at
            ).toLocaleString()}
          </p>

        </div>

      </div>

      <p className="text-slate-200 mt-4">
        {post.content}
      </p>

      {post.image_url && (
        <img
          src={post.image_url}
          alt="post"
          className="w-full rounded-lg mt-4"
        />
      )}

      <ReactionBar
        post={post}
      />

      <CommentSection
        postId={post.id}
      />

    </div>
  );
}