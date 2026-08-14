// Optional live-update channel for a profile (e.g. supporter count ticking
// up, a new achievement unlocking). No realtime backend is wired into this
// project yet, so this subscribes to a global `window.profileRealtimeClient`
// if one is ever provided, and is a safe no-op otherwise - the profile page
// works identically with or without it.
//
// Expected shape of window.profileRealtimeClient, if present:
//   subscribe(channel: string, onEvent: (event) => void): () => void  // returns unsubscribe

export function subscribeToProfile(userId, onEvent) {
  const client = typeof window !== "undefined" ? window.profileRealtimeClient : null;

  if (!client || typeof client.subscribe !== "function") {
    return () => {}; // no-op unsubscribe
  }

  return client.subscribe(`profile:${userId}`, onEvent);
}