// import quiz from "./quiz";
// import whoAmI from "./whoAmI";
// import flags from "./flags";
// import capitals from "./capitals";

// const games = [quiz, whoAmI, flags, capitals];

// export function getGame(gameId) {
//   return games.find((g) => g.id === gameId);
// }

// export function getAllGames() {
//   return games;
// }

import { multipleChoiceGame } from "./mechanics/multipleChoice/game";
import { MultipleChoiceRenderer } from "./mechanics/multipleChoice/renderer";

import { inputGuessGame } from "./mechanics/inputGuess/game";
import { InputGuessRenderer } from "./mechanics/inputGuess/renderer";

import capitals from "./content/capitals";
import flags from "./content/flags";
import whoAmI from "./content/whoAmI";
import riddles from "./content/riddles";

const mechanics = {
  MULTIPLE_CHOICE: {
    game: multipleChoiceGame,
    renderer: MultipleChoiceRenderer
  },
  INPUT_GUESS: {
    game: inputGuessGame,
    renderer: InputGuessRenderer
  }
};

const content = {
  capitals,
  flags,
  whoAmI,
  riddles
};

export function resolveGame(contentKey) {
  const cfg = content[contentKey];

  if (!cfg) throw new Error("Invalid content");

  const mech = mechanics[cfg.type];

  if (!mech) throw new Error("Invalid mechanic");

  return {
    game: mech.game,
    renderer: mech.renderer,
    config: cfg
  };
}