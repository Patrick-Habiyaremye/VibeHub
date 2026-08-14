import React from "react";

import useChallengeSession
from "../hooks/useChallengeSession";



export default function FlagQuizPlayer(){


const {

question,

submitAnswer,

score,

timer

}=useChallengeSession();




if(!question){

return (

<div>

Loading question...

</div>

);

}




return (

<div className="
space-y-6
p-6
">


<div className="
flex
justify-between
">

<div>

Score:
{score}

</div>


<div>

Time:
{timer}s

</div>


</div>





<h2 className="
text-xl
font-bold
">

Which country owns this flag?

</h2>





<img

src={question.image}

alt="flag"

className="
w-64
rounded-xl
"

/>





<div className="
grid
gap-3
">


{
question.options?.map(option=>(


<button

key={option}

onClick={()=>submitAnswer(option)}

className="
p-3
rounded-lg
bg-gray-800
text-white
hover:bg-gray-700
"

>


{option}


</button>


))
}



</div>



</div>

);


}