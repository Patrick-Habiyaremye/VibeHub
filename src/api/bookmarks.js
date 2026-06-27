// api/bookmarks.js

import { supabase }
from "../supabaseClient";



export async function addBookmark(

userId,

postId

){

const { data,error }

=

await supabase

.from("bookmarks")

.upsert({

user_id:

userId,

post_id:

postId

})

.select()

.single();

if(error)

throw error;

return data;

}



export async function removeBookmark(

userId,

postId

){

const { error }

=

await supabase

.from("bookmarks")

.delete()

.eq(

"user_id",

userId

)

.eq(

"post_id",

postId

);

if(error)

throw error;

}



export async function getBookmarks(

userId

){

const { data,error }

=

await supabase

.from("bookmarks")

.select(`

*,

posts(

*,

profiles(

username,

avatar_url

)

)

`)

.eq(

"user_id",

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