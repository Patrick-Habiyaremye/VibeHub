export default function ReelDescription({

caption,

hashtags=[]

}){

return(

<div className="mt-2">

<p className="text-white">

{caption}

</p>

<div className="

flex

gap-2

mt-2

flex-wrap

">

{

hashtags.map(tag=>(

<span

key={tag}

className="

text-blue-400

text-sm

"

>

#{tag}

</span>

))

}

</div>

</div>

);

}