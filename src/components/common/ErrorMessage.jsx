export default function ErrorMessage({

message,

}) {

return(

<div className="

bg-red-500/10

border

border-red-500

text-red-300

rounded-xl

p-4

">

{message}

</div>

);

}