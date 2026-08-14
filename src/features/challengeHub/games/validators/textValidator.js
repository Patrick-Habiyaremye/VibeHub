import { correctResult, wrongResult, } from "../core/results";

export function textValidator(
 question,
 answer
){

 if(!answer){

   return wrongResult(
     "Empty answer"
   );

 }


 const correct =
 answer
 .trim()
 .toLowerCase()
 ===
 question.answer
 .trim()
 .toLowerCase();



 if(correct){

   return correctResult(5);

 }


 return wrongResult(
   "Try another answer"
 );

}