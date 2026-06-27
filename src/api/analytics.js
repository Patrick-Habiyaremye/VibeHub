// api/analytics.js

import { supabase }
from "../supabaseClient";


export async function getAnalytics(

userId

){

const { data,error }

=

await supabase

.from("analytics")

.select("*")

.eq(

"user_id",

userId

)

.single();

if(error)

throw error;

return data;

}