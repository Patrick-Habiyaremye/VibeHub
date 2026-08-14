import { multipleChoiceValidator } 
from "../../validators/multipleChoiceValidator";


export default {

  type:"flag",

  answerType:"multiple_choice",

  hasMedia:true,


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