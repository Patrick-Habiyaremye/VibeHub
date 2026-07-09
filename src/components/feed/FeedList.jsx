import PostCard from "../../features/post/PostCard";
import VideoRenderer from "../../features/post/VideoRenderer";

export default function FeedList({ posts = [] }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center text-slate-400 py-10">
        No posts yet. Be the first to share something 💛
      </div>
    );
  }

  return (
    <div
      className="
        flex
        flex-col
        gap-4
        sm:gap-5
        md:gap-6
      "
    >
      {posts.map((post) =>
        post.media_type === "video" ? (
          <div
            key={post.id}
            className="w-full"
          >
            <VideoRenderer post={post} />
          </div>
        ) : (
          <div
            key={post.id}
            className="w-full"
          >
            <PostCard post={post} />
          </div>
        )
      )}
    </div>
  );
}