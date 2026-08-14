import { ACTIVITY_TYPES } from "../constants/profileActivity.constants";

// Attaches display copy/icon to each raw activity item, grouped by day so
// the Activity tab can render day-separated sections instead of a flat list.
export function buildActivityGroups(activityItems = []) {
  const groups = new Map();

  for (const item of activityItems) {
    const meta = ACTIVITY_TYPES[item.type] || ACTIVITY_TYPES.default;
    const dayKey = item.createdAt ? new Date(item.createdAt).toDateString() : "Unknown date";

    if (!groups.has(dayKey)) groups.set(dayKey, []);
    groups.get(dayKey).push({ ...item, icon: meta.icon, label: meta.label });
  }

  return Array.from(groups.entries()).map(([day, items]) => ({ day, items }));
}