// players/memory.js

export default {
  type: "memory",
  mode: "interactive",
  answerType: "multiple_choice", // fallback for renderer

  hasMedia: true,

  transformQuestion: (q) => ({
    ...q,
    answerType: "multiple_choice",

    // custom structure for memory grid
    cards: q.cards || [],
  }),

  validateAnswer: (question, answer) => {
    // memory logic is usually handled in UI/engine
    // this is just a fallback

    return Array.isArray(answer) && answer.length === 2;
  },
};