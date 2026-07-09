// import {
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";

// import { getFeed } from "../../api/content";

// import ReelCard from "../../features/reels/ReelCard";
// import ReelSkeleton from "../../features/reels/ReelSkeleton";

// export default function ReelFeed({ search = "" }) {
//   const [feed, setFeed] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [hasMore, setHasMore] = useState(true);

//   const containerRef = useRef(null);
//   const observer = useRef(null);

//   const [activeIndex, setActiveIndex] = useState(0);
//   const [activeAudioIndex, setActiveAudioIndex] = useState(null);

//   // -----------------------
//   // LOAD FEED (UNIFIED)
//   // -----------------------
//   useEffect(() => {
//     const load = async () => {
//       try {
//         const data = await getFeed();
//         setFeed(data || []);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//   }, []);

//   // -----------------------
//   // 🎬 DERIVE REELS
//   // -----------------------
//   const reels = useMemo(() => {
//     return feed.filter((p) => p.media_type === "video");
//   }, [feed]);

//   // -----------------------
//   // 🔍 SEARCH (FIXED FIELD)
//   // -----------------------
//   const filtered = useMemo(() => {
//     if (!search.trim()) return reels;

//     const q = search.toLowerCase();

//     return reels.filter((r) =>
//       (r.content || "").toLowerCase().includes(q)
//     );
//   }, [reels, search]);

//   // -----------------------
//   // 👁️ INTERSECTION OBSERVER
//   // -----------------------
//   useEffect(() => {
//     if (!containerRef.current) return;

//     observer.current?.disconnect();

//     observer.current = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (!entry.isIntersecting) return;
//           if (entry.intersectionRatio < 0.85) return;

//           const index = Number(entry.target.dataset.index);
//           setActiveIndex(index);

//           // ⚠️ TEMP: no pagination yet
//           if (index >= filtered.length - 2 && hasMore) {
//             // future: cursor pagination
//             setHasMore(false);
//           }
//         });
//       },
//       {
//         root: containerRef.current,
//         threshold: [0.85],
//       }
//     );

//     const items =
//       containerRef.current.querySelectorAll(".reel-item");

//     items.forEach((item) =>
//       observer.current.observe(item)
//     );

//     return () => observer.current?.disconnect();
//   }, [filtered, hasMore]);

//   // -----------------------
//   // 🎯 NAVIGATION
//   // -----------------------
//   const scrollToIndex = (index) => {
//     const container = containerRef.current;
//     if (!container) return;

//     const next = container.children[index];
//     if (!next) return;

//     container.scrollTo({
//       top: next.offsetTop,
//       behavior: "smooth",
//     });

//     setActiveIndex(index);
//   };

//   const handleVideoEnd = () => {
//     const next = activeIndex + 1;
//     if (next >= filtered.length) return;
//     scrollToIndex(next);
//   };

//   // -----------------------
//   // UI STATES
//   // -----------------------
//   if (loading) {
//     return (
//       <div className="space-y-4 p-4">
//         <ReelSkeleton />
//         <ReelSkeleton />
//       </div>
//     );
//   }

//   if (!filtered.length) {
//     return (
//       <div className="flex h-full items-center justify-center text-slate-400">
//         No reels found.
//       </div>
//     );
//   }

//   return (
//     <div
//       ref={containerRef}
//       className="h-full overflow-y-auto snap-y snap-mandatory"
//     >
//       {filtered.map((reel, index) => (
//         <section
//           key={reel.id}
//           data-index={index}
//           className="reel-item snap-start"
//           style={{
//             height: "calc(100vh - 72px - 64px)",
//           }}
//         >
//           <div className="mx-auto h-full w-full max-w-[480px]">

//             <ReelCard
//               reel={reel} // 🔥 SAME DATA MODEL
//               isActive={index === activeIndex}
//               preloadNext={index === activeIndex + 1}
//               isAudioActive={index === activeAudioIndex}
//               onActivateAudio={() =>
//                 setActiveAudioIndex(index)
//               }
//               onVideoEnd={handleVideoEnd}
//             />

//           </div>
//         </section>
//       ))}
//     </div>
//   );
// }
// import * as RW from "react-window";
// import { useMemo, useState } from "react";
// import useFeed from "../../hooks/useFeed";
// import ContentCard from "../../features/post/ContentCard";
// import MediaRenderer from "../../features/post/MediaRenderer";

// const List = RW.FixedSizeList;

// export default function ReelFeed() {
//   const { feed, fetchMore } = useFeed();

//   const reels = useMemo(
//     () => feed.filter((p) => p.type === "reel"),
//     [feed]
//   );

//   const [activeIndex, setActiveIndex] = useState(0);

//   const Row = ({ index, style }) => {
//     const post = reels[index];
//     if (!post) return null;

//     if (index >= reels.length - 2) {
//       fetchMore();
//     }

//     return (
//       <div
//         style={style}
//         onMouseEnter={() =>
//           setActiveIndex(index)
//         }
//       >
//         <ContentCard
//           className="h-screen bg-black"
//           media={
//             <MediaRenderer
//               post={post}
//               isActive={index === activeIndex}
//             />
//           }
//         />
//       </div>
//     );
//   };

//   return (
//     <List
//       height={window.innerHeight}
//       itemCount={reels.length}
//       itemSize={window.innerHeight}
//       width="100%"
//     >
//       {Row}
//     </List>
//   );
// }


// import { useEffect, useRef, useState ,forwardRef, useImperativeHandle } from "react";
// import useFeed from "../../hooks/useFeed";
// import ContentCard from "../../features/post/ContentCard";
// import { supabase } from "../../supabaseClient";

// const ReelFeed = forwardRef((props, ref) => {
//   const { feed, fetchMore, hasMore, insertPost } = useFeed();

//   const containerRef = useRef(null);
//   const [activeIndex, setActiveIndex] = useState(0);

//   const reels = feed.filter((p) => p.media?.kind === "video");
//   const handleUpdate = (update) => {
//   insertPost(update); // reuse your existing state logic
// };

//     useImperativeHandle(ref, () => ({
//     handleUpdate,
//   }));

//   // ---------------------------------
//   // Scroll (O(1))
//   // ---------------------------------
//   useEffect(() => {
//     const el = containerRef.current;
//     if (!el) return;

//     let ticking = false;

//     const onScroll = () => {
//       if (!ticking) {
//         requestAnimationFrame(() => {
//           const index = Math.round(
//             el.scrollTop / el.clientHeight
//           );

//           setActiveIndex(index);

//           if (index >= reels.length - 2 && hasMore) {
//             fetchMore();
//           }

//           ticking = false;
//         });

//         ticking = true;
//       }
//     };

//     el.addEventListener("scroll", onScroll);
//     return () => el.removeEventListener("scroll", onScroll);
//   }, [reels.length, hasMore]);

//   // ---------------------------------
//   // Initial load
//   // ---------------------------------
//   useEffect(() => {
//     fetchMore();
//   }, []);

//   // ---------------------------------
//   // Realtime (video only)
//   // ---------------------------------
//   useEffect(() => {
//     const channel = supabase
//       .channel("reels")
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "posts",
//         },
//         async (payload) => {
//           const post = payload.new;

//           if (post.media?.kind !== "video") return;

//           const { data: profile } = await supabase
//             .from("profiles")
//             .select("username, avatar_url")
//             .eq("id", post.user_id)
//             .single();

//           insertPost({
//             ...post,
//             profiles: profile,
//           });
//         }
//       )
//       .subscribe();

//     return () => supabase.removeChannel(channel);
//   }, [insertPost]);

//   // ---------------------------------
//   // UI
//   // ---------------------------------
//   if (reels.length === 0) {
//     return <p className="text-center text-gray-400 mt-10">No reels yet</p>;
//   }

//   return (
//     <div
//       ref={containerRef}
//       className="h-full overflow-y-scroll snap-y snap-mandatory"
//     >
//       {reels.map((post, index) => (
//         <div key={post.id} className="h-full snap-start">
//           <ContentCard
//             post={post}
//             isActive={index === activeIndex}
//           />
//         </div>
//       ))}
//     </div>
//   );
// })

// export default ReelFeed;

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

import useFeed from "../../hooks/useFeed";
import { supabase } from "../../supabaseClient";

import ContentCard from "../../features/post/ContentCard";

const ReelFeed = forwardRef(({ search = "" }, ref) => {
  const { feed, fetchMore, hasMore, insertPost } = useFeed();

  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // -----------------------
  // 🎬 DERIVE REELS
  // -----------------------
  const reels = useMemo(() => {
    return feed.filter((p) => p.media?.kind === "video");
  }, [feed]);

  // -----------------------
  // 🔍 SEARCH
  // -----------------------
  const filtered = useMemo(() => {
    if (!search.trim()) return reels;

    const q = search.toLowerCase();

    return reels.filter((r) =>
      (r.content || "").toLowerCase().includes(q)
    );
  }, [reels, search]);

  // -----------------------
  // HANDLE UPDATE (UPLOAD)
  // -----------------------
  const handleUpdate = (update) => {
    insertPost(update);
  };

  useImperativeHandle(ref, () => ({
    handleUpdate,
  }));

  // -----------------------
  // INITIAL LOAD
  // -----------------------
  useEffect(() => {
    fetchMore();
  }, []);

  // -----------------------
  // SCROLL SNAP + PAGINATION
  // -----------------------
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const index = Math.round(
            el.scrollTop / el.clientHeight
          );

          setActiveIndex(index);

          if (index >= filtered.length - 2 && hasMore) {
            fetchMore();
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [filtered.length, hasMore, fetchMore]);

  // -----------------------
  // REALTIME
  // -----------------------
  useEffect(() => {
    const channel = supabase
      .channel("reels")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        async (payload) => {
          const post = payload.new;

          if (post.media?.kind !== "video") return;

          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", post.user_id)
            .single();

          insertPost({
            ...post,
            profiles: profile,
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [insertPost]);

  // -----------------------
  // UI
  // -----------------------
  if (!filtered.length) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        No reels found
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-scroll snap-y snap-mandatory"
    >
      {filtered.map((post, index) => (
        <div
          key={post.id}
          className="h-full snap-start"
        >
          <ContentCard
            post={post}
            isActive={index === activeIndex}
          />
        </div>
      ))}
    </div>
  );
});

export default ReelFeed;