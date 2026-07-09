// import ImageRenderer from "./ImageRenderer";
// import QuoteRenderer from "./QuoteRenderer";
// import VideoRenderer from "./VideoRenderer";


// export default function MediaRenderer({ post, isActive }) {
//   const media = post?.media;

//   console.log("🎬 MEDIA:", media);

//   if (!media || !media.type) {
//     console.warn("⚠️ Invalid media:", post);
//     return null;
//   }

//   // 🔥 VIDEO
//   if (media.type === "video") {
//     return (
//       <video
//         src={media.url}
//         controls
//         autoPlay={isActive}
//         muted
//         loop
//         playsInline
//         className="w-full max-h-[600px] object-cover"
//       />
//     );
//   }

//   // 🔥 IMAGE
//   if (media.type === "image") {
//     return (
//       <img
//         src={media.url}
//         alt="post"
//         className="w-full max-h-[600px] object-cover"
//       />
//     );
//   }

//   // 🔥 QUOTE
//   if (media.type === "quote") {
//     return (
//       <div className="p-10 text-center text-xl text-white">
//         {post.content}
//       </div>
//     );
//   }

//   console.error("❌ Unknown media type:", media);
//   return null;
// }

// import { useState } from "react";

// export default function MediaRenderer({
//   post,
//   isActive = false,
// }) {
//   const media = post?.media;

//   const [loaded, setLoaded] = useState(false);
//   const [error, setError] = useState(false);

//   if (!media || !media.type) {
//     return null;
//   }

//   //----------------------------------------
//   // QUOTE
//   //----------------------------------------

//   if (media.type === "quote") {
//     return (
//       <div
//         className="
//           min-h-[260px]
//           flex
//           items-center
//           justify-center
//           px-8
//           py-12
//           bg-gradient-to-br
//           from-slate-900
//           via-slate-800
//           to-slate-900
//         "
//       >
//         <p
//           className="
//             text-center
//             text-3xl
//             md:text-4xl
//             font-semibold
//             leading-relaxed
//             text-white
//             max-w-3xl
//             break-words
//           "
//         >
//           {post.content}
//         </p>
//       </div>
//     );
//   }

//   //----------------------------------------
//   // IMAGE
//   //----------------------------------------

//   if (media.type === "image") {
//     return (
//       <div
//         className="
//           relative
//           w-full
//           bg-black
//           overflow-hidden
//           aspect-[4/5]
//         "
//       >
//         {!loaded && (
//           <div
//             className="
//               absolute
//               inset-0
//               animate-pulse
//               bg-slate-800
//             "
//           />
//         )}

//         {error ? (
//           <div
//             className="
//               absolute
//               inset-0
//               flex
//               items-center
//               justify-center
//               text-slate-400
//             "
//           >
//             Unable to load image
//           </div>
//         ) : (
//           <img
//             src={media.url}
//             alt={post.content || "Post image"}
//             loading="lazy"
//             draggable={false}
//             onLoad={() => setLoaded(true)}
//             onError={() => {
//               setLoaded(true);
//               setError(true);
//             }}
//             className="
//               w-full
//               h-full
//               object-cover
//               transition-opacity
//               duration-300
//               select-none
//             "
//           />
//         )}
//       </div>
//     );
//   }

//   //----------------------------------------
//   // VIDEO
//   //----------------------------------------

//   if (media.type === "video") {
//     return (
//       <div
//         className="
//           relative
//           w-full
//           bg-black
//           overflow-hidden
//           aspect-[9/16]
//         "
//       >
//         {!loaded && (
//           <div
//             className="
//               absolute
//               inset-0
//               animate-pulse
//               bg-slate-800
//             "
//           />
//         )}

//         <video
//           src={media.url}
//           poster={media.poster || undefined}
//           controls
//           muted
//           loop
//           playsInline
//           preload="metadata"
//           autoPlay={isActive}
//           onLoadedData={() => setLoaded(true)}
//           onError={() => {
//             setLoaded(true);
//             setError(true);
//           }}
//           className="
//             w-full
//             h-full
//             object-cover
//           "
//         />

//         {error && (
//           <div
//             className="
//               absolute
//               inset-0
//               flex
//               items-center
//               justify-center
//               bg-black/70
//               text-white
//             "
//           >
//             Unable to load video
//           </div>
//         )}
//       </div>
//     );
//   }

//   //----------------------------------------
//   // UNKNOWN
//   //----------------------------------------

//   return (
//     <div
//       className="
//         p-10
//         text-center
//         text-red-400
//       "
//     >
//       Unsupported media type
//     </div>
//   );
// }


import QuoteRenderer from "./QuoteRenderer";
import ImageRenderer from "./ImageRenderer";
import VideoRenderer from "./VideoRenderer";

export default function MediaRenderer({
  post,
  isActive = false,
}) {
  if (!post) return null;

  const media = post.media;

  //----------------------------------
  // ✅ QUOTE (PRIMARY FALLBACK)
  //----------------------------------
  // Your normalizer sets media = null for quotes
  if (!media) {
    if (post.content) {
      return <QuoteRenderer content={post.content} />;
    }

    // No media + no content = nothing to render
    if (import.meta.env.DEV) {
      console.warn("⚠️ Empty post:", post);
    }

    return null;
  }

  //----------------------------------
  // 🔥 TYPE RESOLUTION (DEFENSIVE)
  //----------------------------------
  // Handles BOTH normalized + accidental raw data
  const type = media.type || media.kind;

  //----------------------------------
  // 💣 HARD ASSERT (DEV ONLY)
  //----------------------------------
  if (import.meta.env.DEV) {
    if (!type) {
      console.error("🚨 MEDIA TYPE MISSING:", post);
      throw new Error(
        `Media type missing for post ${post.id}`
      );
    }
  }

  //----------------------------------
  // 🚫 RUNTIME GUARD (PROD SAFE)
  //----------------------------------
  if (!type) {
    return null;
  }

  //----------------------------------
  // 🎯 RENDER SWITCH
  //----------------------------------
  switch (type) {
    case "quote":
      // Should not happen if normalized correctly
      return <QuoteRenderer content={post.content} />;

    case "image":
      if (!media.url) {
        if (import.meta.env.DEV) {
          console.warn("⚠️ Image missing URL:", post);
        }
        return null;
      }

      return (
        <ImageRenderer
          src={media.url}
          alt={post.content}
        />
      );

    case "video":
      if (!media.url) {
        if (import.meta.env.DEV) {
          console.warn("⚠️ Video missing URL:", post);
        }
        return null;
      }

      return (
        <VideoRenderer
          src={media.url}
          poster={media.poster}
          autoPlay={isActive}
          muted
          loop
          controls
        />
      );

    default:
      //----------------------------------
      // 🚨 UNKNOWN TYPE
      //----------------------------------
      if (import.meta.env.DEV) {
        console.error(
          "❌ Unsupported media type:",
          type,
          post
        );
        throw new Error(
          `Unsupported media type: ${type}`
        );
      }

      return null;
  }
}