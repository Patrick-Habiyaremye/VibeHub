// api/report.js

import { supabase }
from "../supabaseClient";


export async function reportPost(

  reporterId,

  postId,

  reason

){

const { data,error }

=

await supabase

.from("reports")

.insert({

reporter_id:

reporterId,

post_id:

postId,

reason,

status:

"pending"

})

.select()

.single();

if(error)

throw error;

return data;

}



export async function getMyReports(

userId

){

const { data,error }

=

await supabase

.from("reports")

.select("*")

.eq(

"reporter_id",

userId

)

.order(

"created_at",

{

ascending:false

}

);

if(error)

throw error;

return data;

}