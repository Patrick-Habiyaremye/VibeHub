export default function ChallengeCard({

challenge,

}) {

return(

<div className="

bg-slate-800

border

border-slate-700

rounded-xl

p-5

">

<h2 className="

text-yellow-400

font-bold

text-xl

">

🌟 {challenge.title}

</h2>

<p className="

text-slate-300

mt-2

">

{challenge.description}

</p>

<button className="

mt-4

bg-yellow-500

text-black

px-4

py-2

rounded-lg

">

Join Challenge

</button>

</div>

);

}