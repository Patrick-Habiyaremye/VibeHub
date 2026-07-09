// hooks/useReelsFeed.js

import {
 useState,
 useRef,
 useCallback
}
from "react";


import { ContentApi }
from "../api/contentApi";



const PAGE_SIZE=10;



export default function useReelsFeed(userId){


const [reels,setReels]=
useState([]);


const [loading,setLoading]=
useState(false);


const [hasMore,setHasMore]=
useState(true);



const cursorRef=
useRef(null);


const loadingRef=
useRef(false);



const fetchMore =
useCallback(async()=>{


if(
 loadingRef.current ||
 !hasMore
)
return;



loadingRef.current=true;

setLoading(true);



try{


const data =
await ContentApi.getReels(
userId,
{
limit:PAGE_SIZE,
cursor:
cursorRef.current
}
);



if(data.length<PAGE_SIZE){

setHasMore(false);

}



setReels(prev=>[
 ...prev,
 ...data
]);



cursorRef.current =
data[
data.length-1
];



}

catch(err){

console.error(
"REELS ERROR",
err
);

}

finally{


loadingRef.current=false;

setLoading(false);

}



},[
hasMore,
userId
]);







return {

reels,

setReels,

loading,

hasMore,

fetchMore

};


}