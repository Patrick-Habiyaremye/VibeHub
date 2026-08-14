import React,{
useState
}
from "react";


import useChallengeSession
from "../hooks/useChallengeSession";





export default function MemoryGamePlayer(){



const {

question,

submitAnswer

}=useChallengeSession();



const [

selected,

setSelected

]=useState([]);




if(!question)
return null;





function choose(card){


const updated =
[
...selected,
card.id
];


setSelected(updated);



if(updated.length===2){


submitAnswer(updated);


setSelected([]);


}


}






return (

<div className="
grid
grid-cols-4
gap-4
p-6
">


{
question.cards?.map(card=>(


<button

key={card.id}

onClick={()=>
choose(card)
}

className="
h-20
rounded
bg-purple-600
text-white
"


>

{


selected.includes(card.id)

?

card.value

:

"?"

}



</button>


))

}



</div>

);


}