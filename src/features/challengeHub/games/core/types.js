// games/core/types.js

export const VALID_STATUS = [
  "idle",
  "playing",
  "paused",
  "correct",
  "wrong",
  "finished",
];

export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateGame(game) {
  assert(game.id, "Game must have an id");
  assert(typeof game.getInitialState === "function", `${game.id}: missing getInitialState`);
  assert(typeof game.handleInput === "function", `${game.id}: missing handleInput`);
  assert(typeof game.update === "function", `${game.id}: missing update`);
}

export function validateConfig(config) {

 assert(
   config,
   "Config is required"
 );


 assert(
   Array.isArray(config.questions),
   "Config must include questions[]"
 );


 assert(
   typeof config.validator === "function",
   "Config must include validator()"
 );

}