// utils/tabLeader.js
//
// Tracks whether THIS tab is the "leader" responsible for driving the
// upload queue. Only one tab should actively push bytes to storage at a
// time; other tabs just mirror state via BroadcastChannel.

const TAB_ID = crypto.randomUUID();
let isLeader = false;

const listeners = new Set();

export function getTabId() {
  return TAB_ID;
}

export function becomeLeader() {
  if (isLeader) return;
  isLeader = true;
  notify();
}

export function resignLeader() {
  if (!isLeader) return;
  isLeader = false;
  notify();
}

export function isTabLeader() {
  return isLeader;
}

/**
 * Subscribe to leadership changes. Returns an unsubscribe function.
 * Callback receives the new `isLeader` boolean.
 */
export function onLeadershipChange(callback) {
  if (typeof callback !== "function") return () => {};
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notify() {
  for (const fn of listeners) {
    try {
      fn(isLeader);
    } catch (err) {
      console.error("tabLeader listener threw:", err);
    }
  }
}