// // C:\code\KeshApp\VibeHub\src\hooks\useSmileMoments.js

// import { useEffect, useRef } from "react";
// import { supabase } from "../supabaseClient";

// const CHANNEL_TOPIC = "smile-moments-realtime";

// // ---------------------------------------------------------------------------
// // Why module-scope `let channelInstance` wasn't enough: it guards against
// // races *within one evaluation of this file*. It does nothing if the file
// // gets evaluated a second time as a separate module instance — a leftover
// // SmileMoments.jsx still importing this hook, an HMR window where the old
// // and new module briefly coexist, a duplicate import path, etc. Each
// // evaluation gets its own `channelInstance = null` and neither knows the
// // other exists, so both still race to `.channel().on().on().on().subscribe()`.
// //
// // Fix: anchor the singleton to `globalThis` instead of module scope.
// // globalThis is the one place on the page that's genuinely singular,
// // independent of how many times this module gets re-evaluated. As a
// // second line of defense, also check supabase.getChannels() for a
// // leftover channel with this topic and remove it before creating a new
// // one, in case some other code path (or a stale module instance that
// // never ran its dispose hook) already has one open.
// // ---------------------------------------------------------------------------

// const GLOBAL_KEY = "__smileMomentsRealtime__";

// function getRegistry() {
//   if (!globalThis[GLOBAL_KEY]) {
//     globalThis[GLOBAL_KEY] = {
//       channel: null,
//       topic: `realtime:${CHANNEL_TOPIC}`,
//       listeners: {
//         insert: new Set(),
//         reaction: new Set(),
//         view: new Set(),
//       },
//     };
//   }
//   return globalThis[GLOBAL_KEY];
// }

// function ensureChannel() {
//   const registry = getRegistry();
//   if (registry.channel) return registry.channel;

//   const stale = supabase.getChannels().find((ch) => ch.topic === registry.topic);
//   if (stale) {
//     supabase.removeChannel(stale);
//   }

//   registry.channel = supabase
//     .channel(CHANNEL_TOPIC)
//     .on(
//       "postgres_changes",
//       { event: "INSERT", schema: "public", table: "smile_moments" },
//       (payload) => registry.listeners.insert.forEach((cb) => cb(payload.new))
//     )
//     .on(
//       "postgres_changes",
//       { event: "INSERT", schema: "public", table: "smile_moment_reactions" },
//       (payload) => registry.listeners.reaction.forEach((cb) => cb(payload.new))
//     )
//     .on(
//       "postgres_changes",
//       { event: "INSERT", schema: "public", table: "smile_moment_views" },
//       (payload) => registry.listeners.view.forEach((cb) => cb(payload.new))
//     )
//     .subscribe((status, err) => {
//       if (status === "CHANNEL_ERROR") {
//         console.error("useSmileMoments: realtime channel error", err);
//       }
//     });

//   return registry.channel;
// }

// if (import.meta.hot) {
//   import.meta.hot.dispose(() => {
//     const registry = globalThis[GLOBAL_KEY];
//     if (registry?.channel) {
//       supabase.removeChannel(registry.channel);
//     }
//     delete globalThis[GLOBAL_KEY];
//   });
// }

// export default function useSmileMoments({ onInsert, onReaction, onView } = {}) {
//   const onInsertRef = useRef(onInsert);
//   const onReactionRef = useRef(onReaction);
//   const onViewRef = useRef(onView);

//   useEffect(() => { onInsertRef.current = onInsert; }, [onInsert]);
//   useEffect(() => { onReactionRef.current = onReaction; }, [onReaction]);
//   useEffect(() => { onViewRef.current = onView; }, [onView]);

//   useEffect(() => {
//     ensureChannel();
//     const registry = getRegistry();

//     const insertFn = (row) => onInsertRef.current?.(row);
//     const reactionFn = (row) => onReactionRef.current?.(row);
//     const viewFn = (row) => onViewRef.current?.(row);

//     registry.listeners.insert.add(insertFn);
//     registry.listeners.reaction.add(reactionFn);
//     registry.listeners.view.add(viewFn);

//     return () => {
//       registry.listeners.insert.delete(insertFn);
//       registry.listeners.reaction.delete(reactionFn);
//       registry.listeners.view.delete(viewFn);
//     };
//   }, []);
// }

// C:\code\KeshApp\VibeHub\src\hooks\useSmileMoments.js
import { useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";

const CHANNEL_TOPIC = "smile-moments-realtime";
const GLOBAL_KEY = "__smileMomentsRealtime__";

function getRegistry() {
  if (!globalThis[GLOBAL_KEY]) {
    globalThis[GLOBAL_KEY] = {
      channel: null,
      topic: `realtime:${CHANNEL_TOPIC}`,
      listeners: { insert: new Set(), reaction: new Set(), view: new Set() },
    };
  }
  return globalThis[GLOBAL_KEY];
}

function ensureChannel() {
  const registry = getRegistry();
  if (registry.channel) return registry.channel;

  const stale = supabase.getChannels().find((ch) => ch.topic === registry.topic);
  if (stale) supabase.removeChannel(stale);

  registry.channel = supabase
    .channel(CHANNEL_TOPIC)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "smile_moments" },
      (payload) => registry.listeners.insert.forEach((cb) => cb(payload.new)))
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "smile_moment_reactions" },
      (payload) => registry.listeners.reaction.forEach((cb) => cb(payload.new)))
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "smile_moment_views" },
      (payload) => registry.listeners.view.forEach((cb) => cb(payload.new)))
    .subscribe((status, err) => {
      if (status === "CHANNEL_ERROR") console.error("useSmileMoments: realtime channel error", err);
    });

  return registry.channel;
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    const registry = globalThis[GLOBAL_KEY];
    if (registry?.channel) supabase.removeChannel(registry.channel);
    delete globalThis[GLOBAL_KEY];
  });
}

export default function useSmileMoments({ onInsert, onReaction, onView } = {}) {
  const onInsertRef = useRef(onInsert);
  const onReactionRef = useRef(onReaction);
  const onViewRef = useRef(onView);

  useEffect(() => { onInsertRef.current = onInsert; }, [onInsert]);
  useEffect(() => { onReactionRef.current = onReaction; }, [onReaction]);
  useEffect(() => { onViewRef.current = onView; }, [onView]);

  useEffect(() => {
    ensureChannel();
    const registry = getRegistry();
    const insertFn = (row) => onInsertRef.current?.(row);
    const reactionFn = (row) => onReactionRef.current?.(row);
    const viewFn = (row) => onViewRef.current?.(row);

    registry.listeners.insert.add(insertFn);
    registry.listeners.reaction.add(reactionFn);
    registry.listeners.view.add(viewFn);

    return () => {
      registry.listeners.insert.delete(insertFn);
      registry.listeners.reaction.delete(reactionFn);
      registry.listeners.view.delete(viewFn);
    };
  }, []);
}