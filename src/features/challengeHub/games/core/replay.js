// games/core/replay.js

export function createReplayRecorder() {
  const history = [];

  return {
    record(input) {
      history.push(event)
    },

    getHistory() {
      return history;
    },
  };
}

// games/core/replay.js

export const replayMiddleware = (recorder) => () => ({
  sendInput: (next) => (input) => {
    recorder.record(input);
    return next(input);
  },
});


// games/core/replay.js

export function replaySession(game, config, history) {
  let state = game.getInitialState(config);

  history.forEach(({ input }) => {
    state = game.handleInput(state, input, config);
    state = game.update(state, config, 0);
  });

  return state;
}