// components/ChallengeCard.jsx

import React from "react";
import {useNavigate} from "react-router-dom";
import { getCategoryConfig } from "../utils/categories";

export default function ChallengeCard({
  challenge
}) {


const navigate = useNavigate();



const categoryConfig =
getCategoryConfig(
  challenge.category
);



if(!categoryConfig)
return null;



function startChallenge(){


navigate(
 `/challenge/play/${challenge.id}`
);


}



return (

<div

onClick={startChallenge}

className="
rounded-2xl
p-4
cursor-pointer
bg-white
border-2
hover:scale-[1.02]
transition
"

>


<div className="
text-3xl
">

{categoryConfig.icon}

</div>



<h3 className="
font-bold
text-lg
">

{challenge.title}

</h3>



<p className="
opacity-70
">

{challenge.description}

</p>



<div>

{categoryConfig.name}

{" • "}

{challenge.subCategory}

</div>



<button

onClick={(e)=>{


e.stopPropagation();


startChallenge();


}}

className="
mt-4
px-4
py-2
rounded-lg
bg-black
text-white
"

>

Start Challenge

</button>



</div>


);


}