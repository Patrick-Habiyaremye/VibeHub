import { textValidator }
from "../../validators/textValidator";


export default {

 type:"riddle",

 answerType:"text",

 hasMedia:false,


 transformQuestion(q){

   return {
     ...q,

     answer:
       q.answer ?? q.correctAnswer
   };

 },


 validateAnswer:
   textValidator

};