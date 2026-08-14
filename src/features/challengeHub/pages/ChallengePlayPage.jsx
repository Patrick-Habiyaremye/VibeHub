import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { useChallengeSession } from "../context/ChallengeSessionContext";
import GamePlayer from "./GamePlayer";

export default function ChallengePlayPage() {
  const { id } = useParams();

  const {
    session,
    start,
  } = useChallengeSession();

  useEffect(() => {
    start(id);
  }, [id, start]);

  if (!session) {
    return <div>Loading challenge...</div>;
  }

  return (
    <GamePlayer
      type={session.type}
    />
  );
}

// import {
// useParams
// }
// from "react-router-dom";


// import {
// useEffect
// }
// from "react";


// import {
// useChallengeSession
// }
// from "../context/ChallengeSessionContext";


// import GamePlayer
// from "./GamePlayer";



// export default function ChallengePlayPage(){


// const {
// id
// }=useParams();


// const {
// start
// }=useChallengeSession();




// useEffect(()=>{
// async function load(){
// const response = await fetch(`/api/challenges/${id}/play`);
// //const data = await response.json()
// const text = await response.text();
// console.log(text);
// await start(
// text.challenge
// );
// }
// load();
// },[id]);




// return (

// //<GamePlayer type={session.challenge.type}/>

// <GamePlayer type={challenge.type}/>

// );


// }