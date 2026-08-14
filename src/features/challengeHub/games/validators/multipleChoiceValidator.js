import { correctResult, wrongResult, } from "../core/results";


export function multipleChoiceValidator(
  question,
  answer
){

  const correct =
    answer === question.answer;


  if(correct){

    return correctResult(1);

  }


  return wrongResult(
    "Incorrect answer"
  );

}

// Later you can improve and case handling.:
// answer.trim()