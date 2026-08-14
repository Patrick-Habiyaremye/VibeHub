// features/create/DraftManager.js
import { DRAFT_KEY } from "./constants";

export const DraftManager = {
  save(draft) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  },

  load() {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  clear() {
    localStorage.removeItem(DRAFT_KEY);
  },
};