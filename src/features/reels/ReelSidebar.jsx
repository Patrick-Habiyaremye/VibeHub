export default function ReelSidebar({

reel

}){

return(

<div className="

absolute

bottom-8

left-4

z-20

max-w-sm

">

<h3 className="

text-white

font-bold

">

@

{

reel.profiles

?.username

}

</h3>

<p className="

text-white

mt-2

">

{

reel.caption

}

</p>

</div>

);

}