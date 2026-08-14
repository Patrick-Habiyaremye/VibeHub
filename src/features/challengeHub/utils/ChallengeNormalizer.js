import {
normalizeQuestion
}
from "./QuestionNormalizer";



export function normalizeChallenge(challenge){



return {


id:
challenge.id,



title:
challenge.title,



type:
challenge.type,



difficulty:
challenge.difficulty,



description:
challenge.description,



questions:

challenge.questions?.map(
normalizeQuestion
) ?? []



};


}