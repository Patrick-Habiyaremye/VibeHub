// features/create/persistence/DraftManager.js
import { DRAFT_KEY } from "../constants";

let timeout;

export const DraftManager = {
  savePartial(data) {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      const existing = this.load() || {};
      const updated = { ...existing, ...data };

      localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
    }, 400);
  },

  load() {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  clear() {
    localStorage.removeItem(DRAFT_KEY);
  },
};