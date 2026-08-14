// games/mechanics/inputGuess/game.js

export const inputGuessGame = {

  id: "input_guess",


  normalizeConfig(config) {

    return {
      ...config,

      questions:
        config.questions.map((q) => ({
          ...q,

          answer:
            q.answer ?? q.correctAnswer,
        })),
    };

  },



  getInitialState() {

    return {

      tick:0,

      index:0,

      guess:"",

      clues:1,

      status:"playing",

      score:0,

    };

  },



  handleInput(state, input, config) {


    if(state.status === "finished") {
      return state;
    }



    const current =
      config.questions[state.index];



    switch(input.type) {



      case "TYPE":

        return {

          ...state,

          guess:
            input.payload.value,

        };





      case "CLUE":

        return {

          ...state,

          clues:
            Math.min(
              state.clues + 1,
              current.clues.length
            ),

        };





      case "SUBMIT": {


        if(!state.guess.trim()) {
          return state;
        }



    const result =
 config.validator(
   current,
   state.guess
 );


return {

 ...state,


 status:
 result.correct
 ? "correct"
 : "wrong",


 score:
 state.score + result.points,


 result,

};

      }





      case "NEXT": {


        const next =
          state.index + 1;



        if(next >= config.questions.length) {

          return {

            ...state,

            status:"finished",

          };

        }



        return {

          ...state,

          index:next,

          guess:"",

          clues:1,

          status:"playing",

        };

      }




      default:
        return state;

    }

  },



  update(state) {

    return {

      ...state,

      tick:
        state.tick + 1,

    };

  },



  isFinished(state) {

    return (
      state.status === "finished"
    );

  },

};

// import { GameEvents } from "../../core/events.js";

// export const inputGuessGame = {
//   getInitialState() {
//     return {
//       attempts: [],
//       status: "playing",
//     };
//   },

//   reduce(state, action) {
//     switch (action.type) {
//       case "SUBMIT_ANSWER": {
//         const answer = action.payload;

//         const newState = {
//           ...state,
//           attempts: [...state.attempts, answer],
//         };

//         return {
//           state: newState,
//           events: [
//             {
//               type: GameEvents.ANSWER_SUBMITTED,
//               payload: {
//                 answer,
//                 attempts: newState.attempts.length,
//               },
//             },
//           ],
//         };
//       }

//       case "FINISH_GAME": {
//         return {
//           state: {
//             ...state,
//             status: "finished",
//           },
//           events: [
//             {
//               type: GameEvents.GAME_FINISHED,
//               payload: {
//                 attempts: state.attempts.length,
//               },
//             },
//           ],
//         };
//       }

//       default:
//         return { state, events: [] };
//     }
//   },
// };