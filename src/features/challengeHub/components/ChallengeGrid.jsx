// components/ChallengeGrid.jsx

// import React from "react";
// import ChallengeCard from "./ChallengeCard";

// export default function ChallengeGrid({
//   challenges = [],
//   onSelect,
// }) {
//   if (!challenges.length) {
//     return <p>No challenges found.</p>;
//   }

//   return (
//     <div
//       style={{
//         display: "grid",
//         gridTemplateColumns:
//           "repeat(auto-fill, minmax(250px, 1fr))",
//         gap: 16,
//       }}
//     >
//       {challenges.map((c) => (
//         <ChallengeCard
//           key={c.id}
//           challenge={c}
//           onClick={onSelect}
//         />
//       ))}
//     </div>
//   );
// }

import React from "react";

import ChallengeCard
from "./ChallengeCard";



export default function ChallengeGrid({
challenges
}){


return (

<div

className="
grid
md:grid-cols-3
gap-5
"

>


{
challenges.map(
challenge=>(


<ChallengeCard

key={challenge.id}

challenge={challenge}

/>


)

)

}



</div>


);


}