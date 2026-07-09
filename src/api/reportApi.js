// features/post/api/reportsApi.js

import { supabase } from "../supabaseClient";


export async function reportContent({

  postId,

  reason,

  description = ""

}) {


const {
 data:{
   user
 },
 error:userError

} = await supabase.auth.getUser();



if(userError)
 throw userError;



if(!user){

 throw new Error(
   "Authentication required"
 );

}



const {
 data,
 error

}=await supabase

.from("reports")

.insert({

 reporter_id:user.id,

 post_id:postId,

 reason,

 description,

 status:"pending"

})

.select()

.single();



if(error)
 throw error;



return data;


}

export async function getMyReports(){


const {
data:{
 user
}

}=await supabase.auth.getUser();



if(!user)
 throw new Error(
 "Authentication required"
 );



const {
data,
error

}=await supabase

.from("reports")

.select("*")

.eq(
"reporter_id",
user.id
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

