export default function ChallengeProgress({

current,

goal,

}) {

const percent =

(current/goal)*100;

return(

<div>

<div className="

w-full

bg-slate-700

rounded-full

h-3

">

<div

className="

bg-yellow-500

h-3

rounded-full

"

style={{

width:`${percent}%`

}}

/>

</div>

<p className="

text-sm

text-slate-300

mt-2

">

{current} / {goal}

</p>

</div>

);

}