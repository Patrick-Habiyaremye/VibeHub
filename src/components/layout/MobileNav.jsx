import {

Home,

Compass,

Play,

MessageCircle,

User,

} from "lucide-react";

import { Link }

from "react-router-dom";

export default function MobileNav(){

return(

<div className="

fixed

bottom-0

left-0

right-0

bg-slate-900

border-t

border-slate-700

flex

justify-around

py-3

lg:hidden

z-50

">

<Link to="/feed">

<Home/>

</Link>

<Link to="/discover">

<Compass/>

</Link>

<Link to="/reels">

<Play/>

</Link>

<Link to="/messages">

<MessageCircle/>

</Link>

<Link to="/profile">

<User/>

</Link>

</div>

);

}