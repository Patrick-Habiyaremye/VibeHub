// pages/Discover/Discover.jsx

// import { useState } from "react";
// import { Search, Upload, Film } from "lucide-react";

// import ReelFeed from "./ReelFeed";
// import ReelUpload from "../../features/reels/ReelUpload";

// export default function Discover() {
//   const [showUpload, setShowUpload] = useState(false);
//   const [search, setSearch] = useState("");

//   return (
//     <div className="relative flex h-[calc(100vh-72px)] flex-col overflow-hidden bg-black">

//       {/* HEADER */}
//       <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-xl">
//         <div className="mx-auto flex h-16 items-center justify-between gap-4 px-4 lg:px-8">

//           {/* LEFT */}
//           <div className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500 text-black">
//               <Film size={20} />
//             </div>

//             <div>
//               <h1 className="text-lg font-bold text-white">Smile Reels</h1>
//               <p className="text-xs text-slate-400">Inspire people with positivity</p>
//             </div>
//           </div>

//           {/* SEARCH */}
//           <div className="hidden flex-1 justify-center md:flex">
//             <div className="flex w-full max-w-md items-center rounded-full border border-slate-700 bg-slate-900 px-4">
//               <Search size={18} className="text-slate-400" />

//               <input
//                 type="text"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search reels..."
//                 className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none"
//               />
//             </div>
//           </div>

//           {/* UPLOAD */}
//           <button
//             onClick={() => setShowUpload(true)}
//             className="flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2.5 font-semibold text-black hover:bg-yellow-400"
//           >
//             <Upload size={18} />
//             <span className="hidden sm:block">Upload</span>
//           </button>
//         </div>
//       </header>

//       {/* FEED */}
//       <main className="flex-1 overflow-hidden">
//         <ReelFeed search={search} />
//       </main>

//       {/* UPLOAD MODAL */}
//       {showUpload && (
//         <ReelUpload
//           open={showUpload}
//           onClose={() => setShowUpload(false)}
//         />
//       )}
//     </div>
//   );
// }

// import { useState } from "react";
// import { Film, Search, Upload } from "lucide-react";

// import ReelFeed from "./ReelFeed";
// import ReelUpload from "../../features/reels/ReelUpload";

// export default function Discover() {
//   const [search, setSearch] = useState("");
//   const [uploadOpen, setUploadOpen] = useState(false);

//   return (
//     <div className="flex h-full flex-col bg-black">

//       {/* Header */}
//       <header className="sticky top-0 z-40 h-16 border-b border-white/10 bg-black/90 backdrop-blur-xl">
//         <div className="mx-auto flex h-full items-center justify-between px-5">

//           <div className="flex items-center gap-3">
//             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500 text-black">
//               <Film size={20} />
//             </div>

//             <div>
//               <h1 className="font-bold text-white">
//                 Smile Reels
//               </h1>

//               <p className="text-xs text-slate-400">
//                 Inspire people with positivity
//               </p>
//             </div>
//           </div>

//           <div className="hidden md:flex flex-1 justify-center px-10">
//             <div className="flex w-full max-w-md items-center rounded-full bg-slate-900 px-4">

//               <Search
//                 size={18}
//                 className="text-slate-400"
//               />

//               <input
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search reels..."
//                 className="w-full bg-transparent px-3 py-3 text-white outline-none"
//               />
//             </div>
//           </div>

//           <button
//             onClick={() => setUploadOpen(true)}
//             className="rounded-xl bg-yellow-500 px-5 py-2 font-semibold text-black transition hover:bg-yellow-400"
//           >
//             <div className="flex items-center gap-2">
//               <Upload size={18} />
//               <span className="hidden sm:block">
//                 Upload
//               </span>
//             </div>
//           </button>

//         </div>
//       </header>

//       <main
//         className="overflow-hidden"
//         style={{
//           height: "calc(100vh - 72px - 64px)",
//         }}
//       >
//         <ReelFeed search={search} />
//       </main>

// <ReelUpload
//   open={uploadOpen}
//   onClose={() => setUploadOpen(false)}
// />

//     </div>
//   );
// }

// import { useRef, useState } from "react";
// import ReelFeed from "./ReelFeed";
// import ReelUpload from "../../features/reels/ReelUpload";

// export default function Discover() {
//   const [search, setSearch] = useState("");
//   const [uploadOpen, setUploadOpen] = useState(false);
//   useUploadQueue((update) => {
//   feedRef.current?.handleUpdate(update);
// });

//   const feedRef = useRef();

//   return (
//     <div className="flex h-full flex-col bg-black">

//       {/* HEADER (unchanged) */}

//       <main
//         className="overflow-hidden"
//         style={{
//           height: "calc(100vh - 72px - 64px)",
//         }}
//       >
//         <ReelFeed ref={feedRef} search={search} />
//       </main>

//       <ReelUpload
//         open={uploadOpen}
//         onClose={() => setUploadOpen(false)}
//         onUploadUpdate={(update) => {
//           feedRef.current?.handleUpdate(update);
//         }}
//       />
//     </div>
//   );
// }

// import { useRef, useState } from "react";
// import { Film, Search, Upload } from "lucide-react";

// import ReelFeed from "./ReelFeed";
// import ReelUpload from "../../features/reels/ReelUpload";
// import useUploadQueue from "../../hooks/useUploadQueue";

// export default function Discover() {
//   const [search, setSearch] = useState("");
//   const [uploadOpen, setUploadOpen] = useState(false);

//   const feedRef = useRef(null);

//   // ✅ CONNECT UPLOAD QUEUE → FEED
//   useUploadQueue((update) => {
//     feedRef.current?.handleUpdate(update);
//   });

//   return (
//     <div className="flex h-full flex-col bg-black">

//       {/* HEADER */}
//       <header className="sticky top-0 z-40 h-16 border-b border-white/10 bg-black/90 backdrop-blur-xl">
//         <div className="mx-auto flex h-full items-center justify-between px-5">

//           {/* LEFT */}
//           <div className="flex items-center gap-3">
//             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500 text-black">
//               <Film size={20} />
//             </div>

//             <div>
//               <h1 className="font-bold text-white">Smile Reels</h1>
//               <p className="text-xs text-slate-400">
//                 Inspire people with positivity
//               </p>
//             </div>
//           </div>

//           {/* SEARCH */}
//           <div className="hidden md:flex flex-1 justify-center px-10">
//             <div className="flex w-full max-w-md items-center rounded-full bg-slate-900 px-4">
//               <Search size={18} className="text-slate-400" />

//               <input
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search reels..."
//                 className="w-full bg-transparent px-3 py-3 text-white outline-none"
//               />
//             </div>
//           </div>

//           {/* UPLOAD */}
//           <button
//             onClick={() => setUploadOpen(true)}
//             className="rounded-xl bg-yellow-500 px-5 py-2 font-semibold text-black hover:bg-yellow-400"
//           >
//             <div className="flex items-center gap-2">
//               <Upload size={18} />
//               <span className="hidden sm:block">Upload</span>
//             </div>
//           </button>

//         </div>
//       </header>

//       {/* FEED */}
//       <main
//         className="overflow-hidden"
//         style={{ height: "calc(100vh - 64px)" }}
//       >
//         <ReelFeed ref={feedRef} search={search} />
//       </main>

//       {/* UPLOAD MODAL */}
//       <ReelUpload
//         open={uploadOpen}
//         onClose={() => setUploadOpen(false)}
//         onUploadUpdate={(update) => {
//           feedRef.current?.handleUpdate(update);
//         }}
//       />
//     </div>
//   );
// }

import { useRef, useState } from "react";
import { Film, Search, Upload } from "lucide-react";

import ReelFeed from "./ReelFeed";
import ReelUpload from "../../features/reels/ReelUpload";
import useUploadQueue from "../../hooks/useUploadQueue";

export default function Discover() {
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  const feedRef = useRef(null);

  // 🔥 CONNECT UPLOAD SYSTEM
  useUploadQueue((update) => {
    feedRef.current?.handleUpdate(update);
  });

  return (
    <div className="flex h-full flex-col bg-black">

      {/* HEADER */}
      <header className="h-16 flex items-center justify-between px-5 border-b border-white/10">
        <div className="flex items-center gap-3 text-white">
          <Film />
          <span className="font-bold">Smile Reels</span>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reels..."
          className="bg-slate-800 px-3 py-2 rounded text-white"
        />

        <button
          onClick={() => setUploadOpen(true)}
          className="bg-yellow-500 px-4 py-2 rounded text-black"
        >
          <Upload />
        </button>
      </header>

      {/* FEED */}
      <main className="flex-1 overflow-hidden">
        <ReelFeed ref={feedRef} search={search} />
      </main>

      {/* UPLOAD */}
      <ReelUpload
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadUpdate={(update) =>
          feedRef.current?.handleUpdate(update)
        }
      />
    </div>
  );
}