/**
 * Groups a flat, chronologically-ordered moments array into per-user
 * "stories" — the unit Instagram/TikTok-style viewers actually navigate.
 *
 * Story ORDER (which ring/story comes first) follows the order users
 * first appear in the input array — so if the input is sorted newest-
 * activity-first (as SmileMoments.jsx's query does), the person with
 * the most recent moment appears first, matching the ring row.
 *
 * Moment order WITHIN each story is normalized to chronological
 * ascending (oldest → newest), regardless of input order, so playback
 * always tells the story forward in time — matching every real
 * stories UI (Instagram, Snapchat, WhatsApp). Without this, a
 * newest-first input array plays each person's story backward.
 */
export function groupMomentsIntoStories(moments) {
  const order = [];
  const byUser = new Map();

  for (const moment of moments) {
    const uid = moment.user_id;
    if (!byUser.has(uid)) {
      byUser.set(uid, {
        userId: uid,
        profile: moment.profiles || null,
        moments: [],
      });
      order.push(uid);
    }
    byUser.get(uid).moments.push(moment);
  }

  return order.map((uid) => {
    const story = byUser.get(uid);
    return {
      ...story,
      moments: [...story.moments].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    };
  });
}

/**
 * Converts a flat index (the old flat-moments API used by callers like
 * a feed grid) into {storyIndex, momentIndex} coordinates within the
 * grouped stories, so existing call sites don't need to change.
 *
 * NOTE: this maps a position in the ORIGINAL flat (newest-first) array
 * onto the now-chronologically-sorted story, so clicking a specific
 * moment thumbnail still opens the viewer at that exact moment, not
 * just at index 0 of its story.
 */
export function flatIndexToCoords(stories, flatIndex, moments) {
  // Preferred path: find the exact moment by id so index math can't
  // drift if `moments` and `stories` were built from different
  // snapshots (e.g. a realtime insert landed between renders).
  const targetMoment = moments?.[flatIndex];
  if (targetMoment) {
    for (let s = 0; s < stories.length; s++) {
      const mi = stories[s].moments.findIndex((m) => m.id === targetMoment.id);
      if (mi !== -1) return { storyIndex: s, momentIndex: mi };
    }
  }

  // Fallback: original flat-offset walk (used if `moments` isn't passed).
  let remaining = flatIndex;
  for (let s = 0; s < stories.length; s++) {
    const len = stories[s].moments.length;
    if (remaining < len) return { storyIndex: s, momentIndex: remaining };
    remaining -= len;
  }
  return { storyIndex: 0, momentIndex: 0 };
}