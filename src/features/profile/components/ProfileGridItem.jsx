// import { memo } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Play,
//   Quote as QuoteIcon,
//   Heart,
//   MessageCircle,
// } from "lucide-react";

// import { resolveQuoteBackground } from "../../post/create/engines/StyleEngine";

// function ProfileGridItem({ post }) {
//   const navigate = useNavigate();

//   if (!post?.id) {
//     return null;
//   }

//   const media = post.media;
//   const kind = media?.kind;

//   const openPost = () => {
//     navigate(`/post/${post.id}`);
//   };

//   // --------------------------------------------------
//   // IMAGE
//   // --------------------------------------------------

//   if (kind === "image") {
//     const imageUrl =
//       media?.thumbnail ||
//       media?.url;

//     if (!imageUrl) {
//       return null;
//     }

//     return (
//       <button
//         type="button"
//         onClick={openPost}
//         className="
//           group
//           relative
//           aspect-square
//           w-full
//           overflow-hidden
//           rounded-sm
//           bg-slate-200
//           focus:outline-none
//           focus-visible:ring-2
//           focus-visible:ring-purple-500
//         "
//         aria-label="Open image post"
//       >
//         <img
//           src={imageUrl}
//           alt=""
//           loading="lazy"
//           decoding="async"
//           className="
//             h-full
//             w-full
//             object-cover
//             transition-transform
//             duration-300
//             group-hover:scale-105
//           "
//           onError={(event) => {
//             event.currentTarget.style.display = "none";
//           }}
//         />

//         <GridOverlay post={post} />
//       </button>
//     );
//   }

//   // --------------------------------------------------
//   // VIDEO
//   // --------------------------------------------------

//   if (kind === "video") {
//     const poster =
//       media?.thumbnail ||
//       media?.poster;

//     return (
//       <button
//         type="button"
//         onClick={openPost}
//         className="
//           group
//           relative
//           aspect-square
//           w-full
//           overflow-hidden
//           rounded-sm
//           bg-black
//           focus:outline-none
//           focus-visible:ring-2
//           focus-visible:ring-purple-500
//         "
//         aria-label="Open video post"
//       >
//         {poster ? (
//           <img
//             src={poster}
//             alt=""
//             loading="lazy"
//             decoding="async"
//             className="
//               h-full
//               w-full
//               object-cover
//               transition-transform
//               duration-300
//               group-hover:scale-105
//             "
//           />
//         ) : media?.url ? (
//           <video
//             src={media.url}
//             muted
//             playsInline
//             preload="metadata"
//             className="
//               h-full
//               w-full
//               object-cover
//             "
//           />
//         ) : (
//           <UnavailableMedia />
//         )}

//         {/* Video indicator */}
//         <div
//           className="
//             pointer-events-none
//             absolute
//             right-2
//             top-2
//             flex
//             h-7
//             w-7
//             items-center
//             justify-center
//             rounded-full
//             bg-black/60
//             text-white
//           "
//         >
//           <Play
//             size={13}
//             fill="currentColor"
//           />
//         </div>

//         <GridOverlay post={post} />
//       </button>
//     );
//   }

//   // --------------------------------------------------
//   // QUOTE
//   // --------------------------------------------------

//   if (kind === "quote") {
//     const text =
//       post.content?.trim();

//     if (!text) {
//       return null;
//     }

//     return (
//       <button
//         type="button"
//         onClick={openPost}
//         className="
//           group
//           relative
//           aspect-square
//           w-full
//           overflow-hidden
//           rounded-sm
//           focus:outline-none
//           focus-visible:ring-2
//           focus-visible:ring-purple-500
//         "
//         aria-label="Open quote post"
//         style={{
//           background:
//             resolveQuoteBackground(
//               post.style?.background
//             ),
//         }}
//       >
//         <div
//           className="
//             flex
//             h-full
//             w-full
//             flex-col
//             items-center
//             justify-center
//             p-4
//             text-center
//             text-white
//           "
//         >
//           <QuoteIcon
//             size={20}
//             className="mb-3 opacity-80"
//           />

//           <p
//             className="
//               line-clamp-6
//               text-sm
//               font-medium
//               leading-relaxed
//               sm:text-base
//             "
//           >
//             {text}
//           </p>
//         </div>

//         <GridOverlay post={post} />
//       </button>
//     );
//   }

//   // --------------------------------------------------
//   // UNKNOWN MEDIA
//   // --------------------------------------------------

//   if (import.meta.env.DEV) {
//     console.warn(
//       "[ProfileGridItem] Unsupported post:",
//       post
//     );
//   }

//   return (
//     <button
//       type="button"
//       onClick={openPost}
//       className="
//         relative
//         aspect-square
//         w-full
//         overflow-hidden
//         rounded-sm
//         bg-slate-100
//       "
//       aria-label="Open post"
//     >
//       <UnavailableMedia />
//     </button>
//   );
// }

// // --------------------------------------------------
// // OVERLAY
// // --------------------------------------------------

// function GridOverlay({ post }) {
//   const hasReactions =
//     typeof post.reaction_count === "number";

//   const hasComments =
//     typeof post.comment_count === "number";

//   if (!hasReactions && !hasComments) {
//     return null;
//   }

//   return (
//     <div
//       className="
//         pointer-events-none
//         absolute
//         inset-0
//         hidden
//         items-center
//         justify-center
//         gap-5
//         bg-black/45
//         text-sm
//         font-semibold
//         text-white
//         group-hover:flex
//       "
//     >
//       {hasReactions && (
//         <span className="flex items-center gap-1.5">
//           <Heart
//             size={17}
//             fill="currentColor"
//           />
//           {post.reaction_count}
//         </span>
//       )}

//       {hasComments && (
//         <span className="flex items-center gap-1.5">
//           <MessageCircle
//             size={17}
//             fill="currentColor"
//           />
//           {post.comment_count}
//         </span>
//       )}
//     </div>
//   );
// }

// // --------------------------------------------------
// // FALLBACK
// // --------------------------------------------------

// function UnavailableMedia() {
//   return (
//     <div
//       className="
//         flex
//         h-full
//         w-full
//         items-center
//         justify-center
//         bg-slate-200
//         text-xs
//         text-slate-500
//       "
//     >
//       Media unavailable
//     </div>
//   );
// }

// export default memo(
//   ProfileGridItem,
//   (prev, next) =>
//     prev.post === next.post ||
//     (
//       prev.post?.id === next.post?.id &&
//       prev.post?.updated_at ===
//         next.post?.updated_at &&
//       prev.post?.content ===
//         next.post?.content
//     )
// );

import { memo } from "react";
import {
  Play,
  Quote as QuoteIcon,
  Heart,
  MessageCircle,
} from "lucide-react";

import { resolveQuoteBackground } from "../../post/create/engines/StyleEngine";

function ProfileGridItem({ post, onOpen }) {
  if (!post?.id) {
    return null;
  }

  const media = post.media;
  const kind = media?.kind;

  // Report the post's id upward — the parent grid owns the "which post is
  // open" state and the full ordered list, so it can build the viewer.
  const openPost = () => {
    onOpen(post.id);
  };

  // --------------------------------------------------
  // IMAGE
  // --------------------------------------------------

  if (kind === "image") {
    const imageUrl = media?.thumbnail || media?.url;

    if (!imageUrl) {
      return null;
    }

    return (
      <button
        type="button"
        onClick={openPost}
        className="group relative aspect-square w-full overflow-hidden rounded-sm bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        aria-label="Open image post"
      >
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <GridOverlay post={post} />
      </button>
    );
  }

  // --------------------------------------------------
  // VIDEO
  // --------------------------------------------------

  if (kind === "video") {
    const poster = media?.thumbnail || media?.poster;

    return (
      <button
        type="button"
        onClick={openPost}
        className="group relative aspect-square w-full overflow-hidden rounded-sm bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        aria-label="Open video post"
      >
        {poster ? (
          <img
            src={poster}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : media?.url ? (
          <video
            src={media.url}
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : (
          <UnavailableMedia />
        )}

        <div className="pointer-events-none absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white">
          <Play size={13} fill="currentColor" />
        </div>

        <GridOverlay post={post} />
      </button>
    );
  }

  // --------------------------------------------------
  // QUOTE
  // --------------------------------------------------

  if (kind === "quote") {
    const text = post.content?.trim();

    if (!text) {
      return null;
    }

    return (
      <button
        type="button"
        onClick={openPost}
        className="group relative aspect-square w-full overflow-hidden rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        aria-label="Open quote post"
        style={{ background: resolveQuoteBackground(post.style?.background) }}
      >
        <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-white">
          <QuoteIcon size={20} className="mb-3 opacity-80" />
          <p className="line-clamp-6 text-sm font-medium leading-relaxed sm:text-base">
            {text}
          </p>
        </div>

        <GridOverlay post={post} />
      </button>
    );
  }

  // --------------------------------------------------
  // UNKNOWN MEDIA
  // --------------------------------------------------

  if (import.meta.env.DEV) {
    console.warn("[ProfileGridItem] Unsupported post:", post);
  }

  return (
    <button
      type="button"
      onClick={openPost}
      className="relative aspect-square w-full overflow-hidden rounded-sm bg-slate-100"
      aria-label="Open post"
    >
      <UnavailableMedia />
    </button>
  );
}

// --------------------------------------------------
// OVERLAY
// --------------------------------------------------

function GridOverlay({ post }) {
  const hasReactions = typeof post.reaction_count === "number";
  const hasComments = typeof post.comment_count === "number";

  if (!hasReactions && !hasComments) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 hidden items-center justify-center gap-5 bg-black/45 text-sm font-semibold text-white group-hover:flex">
      {hasReactions && (
        <span className="flex items-center gap-1.5">
          <Heart size={17} fill="currentColor" />
          {post.reaction_count}
        </span>
      )}

      {hasComments && (
        <span className="flex items-center gap-1.5">
          <MessageCircle size={17} fill="currentColor" />
          {post.comment_count}
        </span>
      )}
    </div>
  );
}

// --------------------------------------------------
// FALLBACK
// --------------------------------------------------

function UnavailableMedia() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-200 text-xs text-slate-500">
      Media unavailable
    </div>
  );
}

export default memo(
  ProfileGridItem,
  (prev, next) =>
    prev.onOpen === next.onOpen &&
    (prev.post === next.post ||
      (prev.post?.id === next.post?.id &&
        prev.post?.updated_at === next.post?.updated_at &&
        prev.post?.content === next.post?.content))
);