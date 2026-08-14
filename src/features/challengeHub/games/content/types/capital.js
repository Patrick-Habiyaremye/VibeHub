import { multipleChoiceValidator } from "../../validators/multipleChoiceValidator";


export default {

  type:"capital",

  answerType:"multiple_choice",

  hasMedia:false,


  transformQuestion(q){

    return {
      ...q,

      answer:
        q.answer ?? q.correctAnswer
    };

  },


  validateAnswer:
    multipleChoiceValidator

};