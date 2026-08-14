// components/FeaturedChallenge.jsx

import React from "react";

import ChallengeCard
from "./ChallengeCard";


export default function FeaturedChallenge({
challenge
}){


if(!challenge)
return null;



return (

<div

className="
border-2
rounded-2xl
p-5
"

>


<h2>

⭐ Featured

</h2>



<ChallengeCard

challenge={challenge}

/>


</div>


);


}