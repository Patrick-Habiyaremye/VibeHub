export default function Modal({

open,

title,

children,

onClose,

}) {

if(!open) return null;

return(

<div className="

fixed

inset-0

bg-black/60

z-50

flex

items-center

justify-center

">

<div className="

bg-slate-800

rounded-2xl

w-full

max-w-lg

p-6

">

<div className="

flex

justify-between

mb-4

">

<h2 className="

text-xl

font-bold

text-white

">

{title}

</h2>

<button

onClick={onClose}

className="text-slate-400"

>

✕

</button>

</div>

{children}

</div>

</div>

);

}