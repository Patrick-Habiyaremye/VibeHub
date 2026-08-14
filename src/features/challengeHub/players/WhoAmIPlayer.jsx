import React, {
useState
}
from "react";


import useChallengeSession
from "../hooks/useChallengeSession";




export default function WhoAmIPlayer(){


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
space-y-5
p-6
">



<h2>

Who am I?

</h2>



<ul>

{
question.clues?.map(
(clue,index)=>(


<li key={index}>

{clue}

</li>


)

)

}

</ul>





<input

value={answer}

onChange={
e=>setAnswer(e.target.value)
}

placeholder="
Enter your answer
"

className="
border
p-3
rounded
"

/>




<button

onClick={()=>{


submitAnswer(answer);


setAnswer("");


}}

>

Submit

</button>



</div>

);


}