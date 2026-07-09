// import useBookmarks from "./hooks/useBookmarks";

// export default function BookmarkButton({ postId }) {
//   const {
//     toggleBookmark,
//     isBookmarked,
//   } = useBookmarks();

//   const active = isBookmarked(postId);

//   return (
//     <button
//       onClick={() => toggleBookmark(postId)}
//       className={`
//         flex items-center gap-2 text-sm transition
//         ${active ? "text-yellow-400" : "text-gray-400"}
//         hover:text-yellow-300
//       `}
//     >
//       {active ? "★ Saved" : "☆ Save"}
//     </button>
//   );
// }

import useBookmarks from "./hooks/useBookmarks";

export default function BookmarkButton({ postId }) {
  const {
    toggleBookmark,
    isBookmarked,
    loading,
  } = useBookmarks();

  const active = isBookmarked(postId);

  return (
    <button
      onClick={() => toggleBookmark(postId)}
      disabled={loading}
      className={`
        flex items-center gap-2 text-sm transition
        ${active ? "text-yellow-400" : "text-gray-400"}
        hover:text-yellow-300
        ${loading ? "opacity-50" : ""}
      `}
    >
      {active ? "★ Saved" : "☆ Save"}
    </button>
  );
}