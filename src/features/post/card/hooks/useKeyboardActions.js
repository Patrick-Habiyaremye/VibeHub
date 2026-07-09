import {
  useEffect
} from "react";



const DEFAULT_KEYS = {

  like:"l",

  comment:"c",

  share:"s",

  save:"b",

  escape:"Escape"

};



export default function useKeyboardActions({

  enabled=true,

  keys={},

  onLike,

  onComment,

  onShare,

  onBookmark,

  onEscape


}){


useEffect(()=>{


if(!enabled)
return;



const shortcuts = {

 ...DEFAULT_KEYS,

 ...keys

};




function handleKeyDown(event){



const target =
event.target;



const typing =
[
"INPUT",
"TEXTAREA",
"SELECT"
]
.includes(
target.tagName
);



if(typing)
return;



if(event.ctrlKey ||
event.metaKey)
return;




switch(event.key){



case shortcuts.like:

event.preventDefault();

onLike?.();

break;



case shortcuts.comment:

event.preventDefault();

onComment?.();

break;



case shortcuts.share:

event.preventDefault();

onShare?.();

break;



case shortcuts.save:

event.preventDefault();

onBookmark?.();

break;



case shortcuts.escape:

onEscape?.();

break;



default:

break;

}



}



window.addEventListener(
"keydown",
handleKeyDown
);



return ()=>{


window.removeEventListener(
"keydown",
handleKeyDown
);


};


},[
enabled,
keys,
onLike,
onComment,
onShare,
onBookmark,
onEscape

]);



}