// context/ChallengeContext.jsx

import {

createContext,

useContext,

useState,

useEffect,

} from "react";

import {

getDailyChallenge,

} from "../api/challenges";


const ChallengeContext

=

createContext();


export function

ChallengeProvider({

children

}){

const [

challenge,

setChallenge

]

=

useState(null);


const [

loading,

setLoading

]

=

useState(true);


const loadChallenge =
async () => {

  try {

    setLoading(true);

    const data =
      await getDailyChallenge();

    if (data) {

      setChallenge(data);

    } else {

      setChallenge(null);

    }

  }

  catch(err) {

    console.error(err);

  }

  finally {

    setLoading(false);

  }

};


useEffect(()=>{

loadChallenge();

},[]);


return(

<ChallengeContext.Provider

value={{

challenge,

setChallenge,

loading,

reload:

loadChallenge,

}}

>

{children}

</ChallengeContext.Provider>

);

}


export function

useChallenge(){

return useContext(

ChallengeContext

);

}