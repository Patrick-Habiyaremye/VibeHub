// context/ReelsContext.jsx

import {

createContext,

useContext,

useState,

useEffect,

} from "react";

import {

getReels,

} from "../api/reels";


const ReelsContext

=

createContext();


export function

ReelsProvider({

children

}){

const [

reels,

setReels

]

=

useState([]);


const [

loading,

setLoading

]

=

useState(true);


const loadReels

=

async()=>{

try{

setLoading(true);

const data=

await getReels();

setReels(

data || []

);

}

catch(err){

console.error(err);

}

finally{

setLoading(false);

}

};


useEffect(()=>{

loadReels();

},[]);


return(

<ReelsContext.Provider

value={{

reels,

setReels,

loading,

reload:

loadReels,

}}

>

{children}

</ReelsContext.Provider>

);

}


export function

useReels(){

return useContext(

ReelsContext

);

}