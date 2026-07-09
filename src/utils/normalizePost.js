// export function normalizePost(raw) {
//   if (!raw) return null;

//   const isVideo =
//     raw.media_type === "video" ||
//     raw.video_url;

//   return {
//     id: raw.id,

//     type: isVideo ? "reel" : "post",

//     content: raw.content || "",

//     media: {
//       kind: isVideo
//         ? "video"
//         : raw.image_url
//         ? "image"
//         : "quote",

//       src:
//         raw.video_url ||
//         raw.image_url ||
//         raw.media_url ||
//         null,

//       thumbnail: raw.thumbnail_url || null,
//     },

//     profiles: raw.profiles || {
//       username: "Unknown",
//       avatar_url: null,
//     },

//     created_at: raw.created_at,
//   };
// }

// export function normalizePost(raw) {
//   if (!raw) return null;

//   const isVideo =
//     raw.media_type === "video" || !!raw.video_url;

//   const isImage =
//     raw.media_type === "image" || !!raw.image_url;

//   let kind = null;
//   let src = null;

//   if (isVideo) {
//     kind = "video";
//     src = raw.video_url;
//   } else if (isImage) {
//     kind = "image";
//     src = raw.image_url;
//   } else if (raw.content) {
//     kind = "quote";
//     src = null;
//   }

//   return {
//     id: raw.id,

//     // 🔥 Feed type (used for reels vs posts)
//     type: kind === "video" ? "reel" : "post",

//     content: raw.content || "",

//     media: {
//       kind,                // ✅ ALWAYS: "video" | "image" | "quote" | null
//       src,                 // ✅ ALWAYS null or string
//       thumbnail: raw.thumbnail_url || null,
//     },

//     profiles: raw.profiles || {
//       username: "Unknown",
//       avatar_url: null,
//     },

//     created_at: raw.created_at,
//   };
// }

// export default function normalizePost(raw) {
//   if (!raw) return null;

//   let media = null;

//   // ✅ HANDLE NEW STRUCTURE (from DB)
//   if (raw.media) {
//     if (raw.media.kind === "image" && raw.media.url) {
//       media = {
//         kind: "image",
//         src: raw.media.url,
//         alt: "post image",
//       };
//     }

//     if (raw.media.kind === "video" && raw.media.url) {
//       media = {
//         kind: "video",
//         src: raw.media.url,
//         poster: raw.thumbnail_url || "",
//       };
//     }

//     if (raw.media.kind === "text") {
//       media = {
//         kind: "quote",
//         content: raw.content,
//       };
//     }
//   }

//   return {
//     id: raw.id,
//     content: raw.content,
//     created_at: raw.created_at,
//     profiles: raw.profiles,
//     media,
//   };
// }

// export default function normalizePost(raw) {
//   console.log("🔧 RAW POST:", raw);

//   let type = null;
//   let url = null;

//   // ✅ PRIORITY: use raw.media if it exists
//   if (raw.media) {
//     type = raw.media.kind || null;

//     // 🔥 IMPORTANT: build public URL from path
//     if (raw.media.url) {
//       url = raw.media.url;
//     } else if (raw.media.path) {
//       url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${raw.media.path}`;
//     }
//   }

//   // ✅ fallback (only if NO media exists)
//   if (!type) {
//     if (raw.content) {
//       type = "quote";
//     }
//   }

//   // const normalized = {
//   //   id: raw.id,
//   //   content: raw.content,
//   //   created_at: raw.created_at,
//   //   profiles: raw.profiles,

//   //   media: {
//   //     type,
//   //     url,
//   //   },
//   // };

//   const normalized = {
//   id: raw.id,
//   content: raw.content,
//   created_at: raw.created_at,
//   profiles: raw.profiles,
//   media: {
//     type,
//     url,
//   },
// };
// console.log("✅ NORMALIZED:", normalized);
//   return normalized;
// }


// export default function normalizePost(raw) {
//   if (!raw) return null;

//   const media = raw.media ?? {};

//   //----------------------------------
//   // MEDIA TYPE
//   //----------------------------------

//   const type =
//     media.type ??
//     media.kind ??
//     (raw.content ? "quote" : null);

//   //----------------------------------
//   // MEDIA URL
//   //----------------------------------

//   let url =
//     media.url ??
//     null;

//   // Build public URL if only a storage path exists.
//   if (!url && media.path) {
//     url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/posts/${media.path}`;
//   }

//   //----------------------------------
//   // POSTER
//   //----------------------------------

//   const poster =
//     media.poster ??
//     media.thumbnail ??
//     null;

//   //----------------------------------
//   // NORMALIZED OBJECT
//   //----------------------------------

//   const normalized = {
//     id: raw.id,

//     content: raw.content ?? "",

//     created_at: raw.created_at,

//     profiles: raw.profiles ?? null,

//     media: {
//       type,
//       url,
//       poster,
//     },
//   };

//   console.log("✅ NORMALIZED POST:", normalized);

//   return Object.freeze(normalized);
// }

export default function normalizePost(raw) {
  if (!raw) return null;

  //----------------------------------
  // MEDIA SAFE EXTRACTION
  //----------------------------------

  let type = null;
  let url = null;
  let poster = null;

  if (raw.media) {
    type =
      raw.media.type ||
      raw.media.kind ||
      null;

    url =
      raw.media.url ||
      (raw.media.path
        ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/posts/${raw.media.path}`
        : null);

    poster =
      raw.media.poster ||
      raw.media.thumbnail ||
      null;
  }

  //----------------------------------
  // FALLBACK → QUOTE
  //----------------------------------

  if (!type && raw.content) {
    type = "quote";
  }

  //----------------------------------
  // FINAL OBJECT
  //----------------------------------

  const normalized = {
    id: raw.id,
    content: raw.content ?? "",
    created_at: raw.created_at,
    profiles: raw.profiles ?? null,

    // 🚫 DO NOT CREATE FAKE MEDIA
    media:
      type === "quote"
        ? null
        : type
        ? { type, url, poster }
        : null,
  };

console.log("✅ NORMALIZED POST:", normalized);
  return normalized;
}