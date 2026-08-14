// games/core/middleware.js

export function applyMiddleware(session, middlewares = []) {
  let { sendInput, tick } = session;

  middlewares.forEach((mw) => {
    sendInput = mw({ ...session, sendInput, tick }).sendInput || sendInput;
    tick = mw({ ...session, sendInput, tick }).tick || tick;
  });

  return {
    ...session,
    sendInput,
    tick,
  };
}

// games/core/middleware.js (same file or separate)

export const loggerMiddleware = ({ getState }) => ({
  sendInput: (next) => (input) => {
    console.log("INPUT:", input);
    const result = next(input);
    console.log("STATE:", getState());
    return result;
  },

  tick: (next) => (delta) => {
    return next(delta);
  },
});