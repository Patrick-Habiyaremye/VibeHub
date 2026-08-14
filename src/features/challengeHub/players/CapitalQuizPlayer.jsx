import React from "react";

import useChallengeSession
from "../hooks/useChallengeSession";



export default function CapitalQuizPlayer(){



const {

question,

submitAnswer,

score

}=useChallengeSession();




if(!question)
return null;





return (

<div className="
p-6
space-y-5
">


<h2 className="
text-2xl
font-bold
">

What is the capital of:

</h2>




<h1 className="
text-3xl
">

{question.country}

</h1>





<div className="
grid
gap-3
">


{
question.options?.map(
(capital)=>(


<button

key={capital}

onClick={()=>
submitAnswer(capital)
}

className="
rounded-lg
p-3
bg-blue-600
text-white
"

>

{capital}

</button>


)

)

}



</div>




<div>

Score:
{score}

</div>



</div>

);


}