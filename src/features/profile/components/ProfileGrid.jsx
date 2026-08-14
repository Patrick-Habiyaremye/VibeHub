import { useMemo, useState } from "react";
import ProfileGridItem from "./ProfileGridItem";
import ProfilePostViewer from "./ProfilePostViewer";

export default function ProfileGrid({ posts }) {
  const [openPostId, setOpenPostId] = useState(null);

  // Newest first. If your API already returns posts sorted this way,
  // this is a cheap no-op safety net rather than a re-sort.
  const orderedPosts = useMemo(() => {
    return [...(posts || [])].sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });
  }, [posts]);

  if (orderedPosts.length === 0) {
    return <p className="text-gray-500 text-center py-10">No posts yet.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {orderedPosts.map((post) => (
          <ProfileGridItem key={post.id} post={post} onOpen={setOpenPostId} />
        ))}
      </div>

      {openPostId && (
        <ProfilePostViewer
          posts={orderedPosts}
          initialPostId={openPostId}
          onClose={() => setOpenPostId(null)}
        />
      )}
    </>
  );
}