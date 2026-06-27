const reactions=[

"😊",

"💡",

"🙌",

"🌈",

"💛"

];

export default function ReelActions({

reel,

onComment

}){

return(

<div className="

absolute

right-4

bottom-24

flex

flex-col

gap-6

z-20

">

{

reactions.map(

emoji=>(

<button

key={emoji}

className="

text-3xl

hover:scale-125

transition

"

>

{

emoji

}

</button>

)

)

}

<button

onClick={onComment}

className="text-3xl"

>

💬

</button>

</div>

);

}