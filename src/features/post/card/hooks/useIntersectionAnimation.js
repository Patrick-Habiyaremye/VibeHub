import {

useEffect,

useRef,

useState

} from "react";



export default function useIntersectionAnimation({

threshold = 0.15,

rootMargin="100px",

once=true,

onEnter,

onLeave


}={}){


const ref =
useRef(null);



const [
visible,
setVisible
]=useState(false);



const observerRef =
useRef(null);



useEffect(()=>{


const element =
ref.current;


if(!element)
return;



observerRef.current =
new IntersectionObserver(

(entries)=>{


const entry =
entries[0];



if(entry.isIntersecting){


setVisible(true);


onEnter?.();



if(once){

observerRef.current.disconnect();

}


}
else{


if(!once){

setVisible(false);

onLeave?.();

}


}


},


{

threshold,

rootMargin

}


);



observerRef.current.observe(
element
);



return ()=>{


observerRef.current?.disconnect();



};


},[
threshold,
rootMargin,
once,
onEnter,
onLeave
]);





return {


ref,


visible,


isVisible:
visible


};


}