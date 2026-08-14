import { useMemo } from "react";
import { buildImpactCards } from "../engine/ProfileStatsEngine";

export function useProfileStats(stats) {
  return useMemo(() => buildImpactCards(stats), [stats]);
}