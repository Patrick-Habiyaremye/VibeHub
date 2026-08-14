// Turns a reputation model into the numbers a progress bar needs.
export function buildReputationDisplay(reputation) {
  if (!reputation) return { level: 1, title: "Newbie", progressPercent: 0 };
  return {
    level: reputation.level,
    title: reputation.title,
    progressPercent: Math.round(reputation.progress * 100),
  };
}