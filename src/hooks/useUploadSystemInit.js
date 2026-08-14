// hooks/useUploadSystemInit.js
//
// Call this ONCE near the app root (e.g. in App.jsx). Nothing in the
// current code ever called initLeaderElection(), initNetworkMonitor(), or
// restoreQueue() — which means the leader-election system, the
// auto-pause/resume-on-reconnect system, and the "restore queue after a
// reload" system all existed in utils/ but were never actually switched
// on. This hook is that missing switch.

import { useEffect, useRef } from "react";
import { initLeaderElection } from "../utils/leaderElection";
import { initNetworkMonitor } from "../utils/networkMonitor";
import { restoreQueue } from "../utils/restoreQueue";

// Module-level guard (in addition to the ref) so this still only runs
// once even if the component using it unmounts/remounts, e.g. under
// React StrictMode's deliberate double-invoke in development.
let hasBootstrapped = false;

export function useUploadSystemInit() {
  const ranInThisComponent = useRef(false);

  useEffect(() => {
    if (ranInThisComponent.current || hasBootstrapped) return;
    ranInThisComponent.current = true;
    hasBootstrapped = true;

    initNetworkMonitor();
    initLeaderElection();

    restoreQueue().catch((err) =>
      console.error("Failed to restore upload queue:", err)
    );
  }, []);
}