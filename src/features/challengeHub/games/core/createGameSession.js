// games/core/createGameSession.js

import { validateGame, validateConfig } from "./types";
import { prepareContent } from "./contentLoader";
import { createEventEmitter } from "./eventEmitter";
import { createGameEvent } from "./GameEvent";

// export function createGameSession(game, rawConfig, { eventBus }) {
export function createGameSession(game, rawConfig, { eventBus }) {
  validateGame(game);
  const preparedConfig = prepareContent(rawConfig);
  const config = game.normalizeConfig
    ? game.normalizeConfig(preparedConfig)
    : preparedConfig;

  validateConfig(config);

  let state = game.getInitialState(config);
  const events = createEventEmitter();

  function getState() {
    return state;
  }

function sendInput(input){


const previousState = state;


state =
game.handleInput(
 state,
 input,
 config
);



const event =
createGameEvent({

 type: input.type,

 payload: input,

 stateBefore: previousState,

 stateAfter: state,

});



events.emit(event);



return state;

}


// function sendInput(input) {
//   const previousState = state;

//   state = game.handleInput(state, input, config);

//   const event = createGameEvent({
//     type: input.type,
//     payload: input,
//     stateBefore: previousState,
//     stateAfter: state,
//   });

//   // ✅ Local (UI)
//   events.emit(event);

//   // ✅ Global (SYSTEM)
//   if (eventBus) {
//     eventBus.publish(event.type, event);
//   }

//   return state;
// }
  function tick(delta = 0) {
    state = game.update(state, config, delta);

    if (game.isFinished?.(state)) {
      state = { ...state, status: "finished" };
    }

    return state;
  }

return {

 gameId:game.id,

 getState,

 sendInput,

 tick,

 config,

 subscribe:
   events.subscribe

};
}