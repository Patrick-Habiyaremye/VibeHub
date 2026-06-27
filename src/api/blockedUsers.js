import { supabase }

from "../supabaseClient";


export async function getBlockedUsers(

userId

){

const {

data,

error,

}

=

await supabase

.from("blocked_users")

.select(`

*,

blocked:profiles!blocked_user_id(

username,

avatar_url

)

`)

.eq(

"user_id",

userId

);


if(error)

throw error;

return data;

}


export async function blockUser(

userId,

blockedId

){

const {

error,

}

=

await supabase

.from("blocked_users")

.insert({

user_id:userId,

blocked_user_id:blockedId,

});


if(error)

throw error;

}


export async function unblockUser(

id

){

const {

error,

}

=

await supabase

.from("blocked_users")

.delete()

.eq(

"id",

id

);


if(error)

throw error;

}