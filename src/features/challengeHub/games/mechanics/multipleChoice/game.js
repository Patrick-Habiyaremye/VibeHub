// games/mechanics/multipleChoice/game.js

// export const multipleChoiceGame = {
//   id: "multiple_choice",

//   normalizeConfig(config) {
//     return {
//       ...config,
//       questions: config.questions.map(q => ({
//         ...q,
//         answer: q.answer ?? q.correctAnswer, // normalize
//       })),
//     };
//   },

//   getInitialState(config) {
//     return {
//       tick: 0,
//       index: 0,
//       selected: null,
//       status: "playing",
//       score: 0,
//     };
//   },

//   handleInput(state, input, config) {
//     if (state.status === "finished") return state;

//     const current = config.questions[state.index];

//     switch (input.type) {
//       case "SELECT":
//         return { ...state, selected: input.payload.value };

//       case "SUBMIT": {
//         if (state.selected == null) return state;

//         const correct = state.selected === current.answer;

//         return {
//           ...state,
//           status: correct ? "correct" : "wrong",
//           score: correct ? state.score + 1 : state.score,
//         };
//       }

//       case "NEXT": {
//         const nextIndex = state.index + 1;

//         if (nextIndex >= config.questions.length) {
//           return { ...state, status: "finished" };
//         }

//         return {
//           ...state,
//           index: nextIndex,
//           selected: null,
//           status: "playing",
//         };
//       }

//       default:
//         return state;
//     }
//   },

//   update(state) {
//     return { ...state, tick: state.tick + 1 };
//   },

//   isFinished(state) {
//     return state.status === "finished";
//   },
// };

// games/mechanics/multipleChoice/game.js

export const multipleChoiceGame = {
  id: "multiple_choice",

  normalizeConfig(config) {
    return {
      ...config,

      questions: config.questions.map((q) => ({
        ...q,

        // keep this only for backwards compatibility
        answer: q.answer ?? q.correctAnswer,
      })),
    };
  },


  getInitialState() {
    return {
      tick: 0,
      index: 0,
      selected: null,
      status: "playing",
      score: 0,
    };
  },


  handleInput(state, input, config) {

    if (state.status === "finished") {
      return state;
    }


    const current = config.questions[state.index];


    switch (input.type) {


      case "SELECT":

        return {
          ...state,

          selected:
            input.payload.value,

          status:"playing"
        };



      case "SUBMIT": {

        if (state.selected == null) {
          return state;
        }


const result =
 config.validator(
   current,
   state.selected
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

        const nextIndex =
          state.index + 1;


        if (
          nextIndex >=
          config.questions.length
        ) {

          return {
            ...state,
            status:"finished"
          };

        }


        return {
          ...state,

          index:nextIndex,

          selected:null,

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