import { useState } from "react";

import {

uploadReel

}

from "../../api/reels";


export default function ReelUpload(){

const [

video,

setVideo

]

=

useState(null);

const [

caption,

setCaption

]

=

useState("");

const [

loading,

setLoading

]

=

useState(false);


const handleUpload=

async()=>{

if(!video) return;

try{

setLoading(true);

await uploadReel({

video,

caption

});

alert(

"Reel uploaded"

);

}

catch(err){

console.error(err);

}

finally{

setLoading(false);

}

};


return(

<div className="

bg-slate-800

p-6

rounded-xl

">

<input

type="file"

accept="video/*"

onChange={(e)=>

setVideo(

e.target.files[0]

)

}

/>


<textarea

value={caption}

onChange={(e)=>

setCaption(

e.target.value

)

}

placeholder="Share positivity 🌈"

className="

w-full

mt-4

bg-slate-900

p-3

rounded-lg

text-white

"

/>


<button

onClick={handleUpload}

className="

mt-4

bg-yellow-500

text-black

px-4

py-2

rounded-lg

"

>

{

loading

?

"Uploading..."

:

"Upload Reel"

}

</button>

</div>

);

}