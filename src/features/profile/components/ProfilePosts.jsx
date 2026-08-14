import { useState } from "react";
import { useProfileContext } from "../context/ProfileContext";

import ProfileEmpty from "./ProfileEmpty";
import ProfileGridItem from "./ProfileGridItem";
import ProfilePostViewer from "./ProfilePostViewer";

export default function ProfilePosts() {
  const { posts = [], loading } = useProfileContext();
  const [openPostId, setOpenPostId] = useState(null);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1 sm:gap-2">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square animate-pulse rounded-sm bg-slate-200"
          />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return <ProfileEmpty message="No posts yet." />;
  }

  // Newest first. Cheap no-op if the API already sorts this way, and a
  // safety net if it doesn't.
  const orderedPosts = [...posts].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <>
      <section
        aria-label="User posts"
        className="grid grid-cols-3 gap-1 sm:gap-2"
      >
        {orderedPosts.map((post) => (
          <ProfileGridItem key={post.id} post={post} onOpen={setOpenPostId} />
        ))}
      </section>

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

// import { useProfileContext } from "../context/ProfileContext";

// import ProfileEmpty from "./ProfileEmpty";
// import ProfileGridItem from "./ProfileGridItem";

// export default function ProfilePosts() {
//   const {
//     posts = [],
//     loading,
//   } = useProfileContext();

//   if (loading) {
//     return (
//       <div className="grid grid-cols-3 gap-1 sm:gap-2">
//         {Array.from({ length: 9 }).map(
//           (_, index) => (
//             <div
//               key={index}
//               className="
//                 aspect-square
//                 animate-pulse
//                 rounded-sm
//                 bg-slate-200
//               "
//             />
//           )
//         )}
//       </div>
//     );
//   }

//   if (posts.length === 0) {
//     return (
//       <ProfileEmpty message="No posts yet." />
//     );
//   }

//   return (
//     <section
//       aria-label="User posts"
//       className="
//         grid
//         grid-cols-3
//         gap-1
//         sm:gap-2
//       "
//     >
//       {posts.map((post) => (
//         <ProfileGridItem
//           key={post.id}
//           post={post}
//         />
//       ))}
//     </section>
//   );
// }