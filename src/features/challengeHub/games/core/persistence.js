// games/core/persistence.js

const KEY_PREFIX = "game_session_";

export function saveSession(sessionId, data) {
  localStorage.setItem(KEY_PREFIX + sessionId, JSON.stringify(data));
}

export function loadSession(sessionId) {
  const raw = localStorage.getItem(KEY_PREFIX + sessionId);
  return raw ? JSON.parse(raw) : null;
}

export function clearSession(sessionId) {
  localStorage.removeItem(KEY_PREFIX + sessionId);
}


// games/core/persistence.js

export const persistenceMiddleware = (sessionId) => ({ getState }) => ({
  sendInput: (next) => (input) => {
    const result = next(input);

    saveSession(sessionId, {
      state: getState(),
    });

    return result;
  },

  tick: (next) => (delta) => {
    const result = next(delta);

    saveSession(sessionId, {
      state: getState(),
    });

    return result;
  },
});