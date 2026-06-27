import { useState } from "react";

import ReelPlayer from "./ReelPlayer";
import ReelSidebar from "./ReelSidebar";
import ReelActions from "./ReelActions";
import ReelComments from "./ReelComments";

export default function ReelCard({

reel

}){

const [

showComments,

setShowComments

]

=

useState(false);

return(

<div className="

relative

h-screen

snap-start

bg-black

overflow-hidden

">

<ReelPlayer

reel={reel}

/>

<ReelSidebar

reel={reel}

/>

<ReelActions

reel={reel}

onComment={()=>

setShowComments(

true

)

}

/>

{

showComments && (

<ReelComments

reelId={reel.id}

onClose={()=>

setShowComments(

false

)

}

/>

)

}

</div>

);

}