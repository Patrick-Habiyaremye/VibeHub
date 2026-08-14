export function analyticsMiddleware(){

 return ({subscribe})=>{

   subscribe(event=>{


     if(event.type==="ANSWER_SUBMITTED"){

       console.log(
        "Answer:",
        event.payload
       );

     }


   });


 };

}