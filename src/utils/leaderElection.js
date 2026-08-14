// utils/leaderElection.js
//
// Elects exactly one tab as the "leader" that is allowed to drive the
// upload queue (see uploadManager.js). Uses the Web Locks API, which
// automatically releases the lock when a tab closes, reloads, or crashes.

import { becomeLeader, resignLeader, onLeadershipChange } from "./tabLeader";
import { scheduleProcessing } from "./uploadManager";
import { LEADER_ELECTION_RETRY_MS } from "./config";

let initialized = false;
let retryTimer = null;

export function initLeaderElection() {
  if (initialized) return;
  initialized = true;

  // Whenever this tab becomes leader, immediately try to drain the queue.
  onLeadershipChange((leader) => {
    if (leader) scheduleProcessing();
  });

  if (!("locks" in navigator)) {
    // Very old browser without Web Locks: degrade gracefully rather than
    // risk a racy hand-rolled election.
    console.warn("Web Locks API unavailable; assuming single active tab.");
    becomeLeader();
    return;
  }

  requestLeadership();
}

function requestLeadership() {
  navigator.locks
    .request("upload-leader-lock", { mode: "exclusive" }, () => {
      becomeLeader();

      // Never resolves: this tab keeps the lock (and leadership) until it
      // closes, reloads, or crashes — the browser releases it automatically.
      return new Promise(() => {});
    })
    .catch((err) => {
      resignLeader();
      console.error("Leader election failed, will retry:", err);
      scheduleRetry();
    });
}

function scheduleRetry() {
  if (retryTimer) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    requestLeadership();
  }, LEADER_ELECTION_RETRY_MS);
}

// If we come back online after a drop, take another shot at leadership in
// case the previous attempt failed for network/environment reasons.
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    if (initialized) scheduleProcessing();
  });
}