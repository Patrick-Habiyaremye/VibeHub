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
import { useAuth } from "./AuthContext";


const ReelsContext

=

createContext();


export function

ReelsProvider({

children

}){

const [reels, setReels] = useState([]);
const [loading,setLoading] = useState(true);
const [activeIndex, setActiveIndex] = useState(0);
const { user } = useAuth();

const loadReels

=

async()=>{

try{

setLoading(true);
const normalizeReel = (reel) => ({
  id: reel.id,
  userId: reel.user_id,
  videoUrl: reel.video_url,
  content: reel.content,
  username:reel.profiles?.username,
  avatar:reel.profiles?.avatar_url,
  vibePoints: reel.vibe_points || 0,
  createdAt: reel.created_at,
});

const data= await getReels(user?.id);
setReels((data || []).map(normalizeReel));
// console.log(data[0]);
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
    reload: loadReels,
    activeIndex,
    setActiveIndex,
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