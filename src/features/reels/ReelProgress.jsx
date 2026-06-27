import { useEffect,useState } from "react";

export default function ReelProgress({

videoRef

}){

const [

progress,

setProgress

]

=

useState(0);


useEffect(()=>{

const video=

videoRef.current;

if(!video) return;

const update=()=>{

setProgress(

(video.currentTime/

video.duration)

*100

||0

);

};

video.addEventListener(

"timeupdate",

update

);

return()=>{

video.removeEventListener(

"timeupdate",

update

);

};

},[]);


return(

<div className="

absolute

top-0

left-0

w-full

h-1

bg-white/20

z-30

">

<div

className="

h-full

bg-white

"

style={{

width:`${progress}%`

}}

/>

</div>

);

}