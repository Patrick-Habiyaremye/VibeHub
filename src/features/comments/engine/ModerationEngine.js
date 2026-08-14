// src/features/comments/engine/ModerationEngine.js
//
// HONEST SCOPE NOTE: this is a basic client-side placeholder — a small
// word list plus a spam heuristic. It is NOT sufficient moderation for a
// real launch (trivially bypassed with spacing/leetspeak, no image/
// context awareness). Treat this as a first line of defense while you
// evaluate a real moderation service (e.g. a Postgres trigger running a
// hosted moderation API, or a provider like OpenAI's moderation
// endpoint) server-side, where it can't be bypassed by a modified client.

const BASIC_BLOCKLIST = ["spamword1", "spamword2"]; // placeholder — replace with a real list

export default class ModerationEngine {
  static check(content) {
    const lower = content.toLowerCase();

    for (const word of BASIC_BLOCKLIST) {
      if (lower.includes(word)) {
        return { allowed: false, reason: "Your comment contains blocked content." };
      }
    }

    // Crude repeated-character spam check (e.g. "aaaaaaaaaaaaaaaa")
    if (/(.)\1{9,}/.test(content)) {
      return { allowed: false, reason: "That looks like spam — try rewriting your comment." };
    }

    return { allowed: true };
  }
}