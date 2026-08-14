import { useMemo } from "react";
import { buildReputationDisplay } from "../engine/ProfileReputationEngine";

export function useProfileReputation(reputation) {
  return useMemo(() => buildReputationDisplay(reputation), [reputation]);
}