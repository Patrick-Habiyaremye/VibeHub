import React,{
useState
}
from "react";


import useChallengeSession
from "../hooks/useChallengeSession";





export default function RiddlePlayer(){



const {

question,

submitAnswer

}=useChallengeSession();




const [

answer,

setAnswer

]=useState("");





if(!question)
return null;





return (

<div className="
p-6
space-y-5
">


<h2>

Solve the riddle

</h2>




<p className="
text-xl
">

{question.text}

</p>





<input

value={answer}

onChange={
e=>setAnswer(e.target.value)
}

className="
border
p-3
"

/>




<button

onClick={()=>{


submitAnswer(answer);

setAnswer("");

}}

>

Answer

</button>



</div>

);


}