import { multipleChoiceGame } from "../games/mechanics/multipleChoice/game";
import { MultipleChoiceRenderer } from "../games/mechanics/multipleChoice/renderer";

import { inputGuessGame } from "../games/mechanics/inputGuess/game";
import { InputGuessRenderer } from "../games/mechanics/inputGuess/renderer";

import capitals from "../games/content/capitals";
import flags from "../games/content/flags";
import riddles from "../games/content/riddles";
import whoAmI from "../games/content/whoAmI";

export const PLAYERS = {
  capital: {
    game: multipleChoiceGame,
    renderer: MultipleChoiceRenderer,
    config: capitals,
  },

  flag: {
    game: multipleChoiceGame,
    renderer: MultipleChoiceRenderer,
    config: flags,
  },

  riddle: {
    game: inputGuessGame,
    renderer: InputGuessRenderer,
    config: riddles,
  },

  who_am_i: {
    game: inputGuessGame,
    renderer: InputGuessRenderer,
    config: whoAmI,
  },
};

// players/index.js

// import { multipleChoiceGame } from "../games/mechanics/multipleChoice/game";
// import { InputGuessRenderer } from "../games/mechanics/inputGuess/renderer";

// import { inputGuessGame } from "../games/mechanics/inputGuess/game";

// import capitals from "../games/content/capitals";
// import flags from "../games/content/flags";
// import riddles from "../games/content/riddles";
// import whoAmI from "../games/content/whoAmI";

// export const PLAYERS = {
//   capital: {
//     mode: "interactive",
//     game: multipleChoiceGame,
//     renderer: null, // you should create one
//     config: capitals
//   },

//   flag: {
//     mode: "interactive",
//     game: multipleChoiceGame,
//     renderer: null,
//     config: flags
//   },

//   riddle: {
//     mode: "interactive",
//     game: inputGuessGame,
//     renderer: InputGuessRenderer,
//     config: riddles
//   },

//   who_am_i: {
//     mode: "interactive",
//     game: inputGuessGame,
//     renderer: InputGuessRenderer,
//     config: whoAmI
//   }
// };