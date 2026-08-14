import { createProfileActivityItemModel } from "../models/ProfileActivityModel";

export function normalizeProfileActivity(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(createProfileActivityItemModel);
}