// import { useRef } from "react";
// import { Camera, Trash2, Loader2 } from "lucide-react";

// export default function ProfileAvatar({
//   avatarImage,
//   isOwnProfile,
//   hasCustomAvatar,
//   avatarState,
//   onSelectFile,
//   onRequestDelete,
// }) {
//   const inputRef = useRef(null);
//   const busy = avatarState.uploading || avatarState.deleting;

//   const handleClick = () => {
//     if (busy) return;
//     inputRef.current?.click();
//   };

//   const handleChange = (e) => {
//     const file = e.target.files?.[0];
//     if (inputRef.current) inputRef.current.value = "";
//     if (file) onSelectFile(file, "avatar");
//   };

//   return (
//     <div className="absolute bottom-0 left-6 translate-y-16 group">
//       <img
//         src={avatarImage}
//         alt="Profile avatar"
//         className="w-40 h-40 rounded-full border-4 border-white object-cover mb-16 bg-gray-100"
//         onError={() => avatarState.setFailed(true)}
//       />

//       {!busy && isOwnProfile && (
//         <div className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
//           <button onClick={handleClick} className="flex flex-col items-center gap-0.5" aria-label="Change avatar">
//             <Camera size={20} />
//             <span className="text-xs">Change</span>
//           </button>
//           {hasCustomAvatar && (
//             <button
//               onClick={() => onRequestDelete("avatar")}
//               className="mt-1 flex items-center gap-1 text-xs text-red-200 hover:text-red-100"
//               aria-label="Remove avatar"
//             >
//               <Trash2 size={12} />
//               Remove
//             </button>
//           )}
//         </div>
//       )}

//       {avatarState.uploading && (
//         <div className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center text-white">
//           <span className="text-sm font-medium">{avatarState.progress}%</span>
//           <div className="w-16 h-1.5 bg-white/30 rounded-full mt-2 overflow-hidden">
//             <div className="h-full bg-white transition-all duration-150" style={{ width: `${avatarState.progress}%` }} />
//           </div>
//         </div>
//       )}

//       {avatarState.deleting && !avatarState.uploading && (
//         <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-white">
//           <Loader2 className="animate-spin" size={22} />
//         </div>
//       )}

//       {isOwnProfile && (
//         <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
//       )}
//     </div>
//   );
// }

import { useRef } from "react";
import { Camera, Trash2, Loader2 } from "lucide-react";

export default function ProfileAvatar({
  avatarImage,
  isOwnProfile,
  hasCustomAvatar,
  avatarState,
  onSelectFile,
  onRequestDelete,
}) {
  const inputRef = useRef(null);

  const busy = avatarState.uploading || avatarState.deleting;

  const handleClick = () => {
    if (busy) return;
    inputRef.current?.click();
  };

  const handleChange = (event) => {
    const file = event.target.files?.[0];

    // Allow selecting the same file again.
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    if (file) {
      onSelectFile(file, "avatar");
    }
  };

  return (
    <div className="relative group w-40 h-40 mb-18">
      {/* Avatar */}
      <img
        src={avatarImage}
        alt="Profile avatar"
        className="
          w-full h-full
          rounded-full
          border-4 border-yellow-300
        "
        onError={(event) => {
          // Prevent broken-image loops.
          event.currentTarget.onerror = null;
          event.currentTarget.src = "/default-avatar.png";

          avatarState.setFailed?.(true);
        }}
      />

      {/* Owner controls */}
      {!busy && isOwnProfile && (
        <div
          className="
            absolute inset-0
            rounded-full
            bg-black/50
            flex flex-col
            items-center justify-center
            text-white
            opacity-0
            group-hover:opacity-100
            transition-opacity
          "
        >
          <button
            type="button"
            onClick={handleClick}
            className="flex flex-col items-center gap-0.5"
            aria-label="Change avatar"
          >
            <Camera size={20} />
            <span className="text-xs">Change</span>
          </button>

          {hasCustomAvatar && (
            <button
              type="button"
              onClick={() => onRequestDelete("avatar")}
              className="
                mt-1
                flex items-center gap-1
                text-xs
                text-red-200
                hover:text-red-100
              "
              aria-label="Remove avatar"
            >
              <Trash2 size={12} />
              Remove
            </button>
          )}
        </div>
      )}

      {/* Upload progress */}
      {avatarState.uploading && (
        <div
          className="
            absolute inset-0
            rounded-full
            bg-black/60
            flex flex-col
            items-center justify-center
            text-white
          "
        >
          <span className="text-sm font-medium">
            {avatarState.progress}%
          </span>

          <div className="w-16 h-1.5 bg-white/30 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-150"
              style={{
                width: `${avatarState.progress}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Delete loading */}
      {avatarState.deleting && !avatarState.uploading && (
        <div
          className="
            absolute inset-0
            rounded-full
            bg-black/60
            flex items-center justify-center
            text-white
          "
        >
          <Loader2 className="animate-spin" size={22} />
        </div>
      )}

      {/* File input */}
      {isOwnProfile && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
          disabled={busy}
        />
      )}
    </div>
  );
}