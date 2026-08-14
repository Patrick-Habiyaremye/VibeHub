// QuestionNormalizer.js

export function normalizeQuestion(question){

    if(!question){
        return null;
    }


    const base = {

        id:
        question.id,


        difficulty:
        question.difficulty ?? "medium",


        points:
        question.points ?? 10,

    };



    switch(question.type){


        case "flag":

            return {

                ...base,

                type:"flag",

                image:
                question.image_url,


                options:
                question.options ?? [],


                answer:
                question.correct_answer

            };





        case "capital":

            return {

                ...base,

                type:"capital",


                country:
                question.country,


                options:
                question.options ?? [],


                answer:
                question.correct_answer

            };






        case "who_am_i":

            return {

                ...base,

                type:"who_am_i",


                clues:
                question.clues ?? [],


                answer:
                question.correct_answer

            };







        case "riddle":

            return {

                ...base,

                type:"riddle",


                text:
                question.text,


                answer:
                question.correct_answer

            };







        case "memory":

            return {

                ...base,

                type:"memory",


                cards:
                question.cards ?? []


            };





        default:


            throw new Error(
                `Unsupported question type ${question.type}`
            );


    }

}