import { textValidator } from "../../validators/textValidator";

export default {

  type: "whoAmI",

  answerType: "text",

  hasMedia: true,

  transformQuestion(q) {
    return {
      ...q,

      answer:
        q.answer ?? q.correctAnswer,
    };
  },

  validateAnswer:
    textValidator,

};