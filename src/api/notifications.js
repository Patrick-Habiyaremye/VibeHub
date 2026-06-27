import { supabase } from "../supabaseClient";


// GET USER NOTIFICATIONS

export async function getNotifications(
  userId
) {

  const { data, error } =
    await supabase

      .from("notifications")

      .select(`

        *,

        actor:profiles!notifications_actor_id_fkey(

          username,

          avatar_url

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


  if(error) throw error;

  return data;

}


// MARK ONE AS READ

export async function markAsRead(

notificationId

){

const { data,error }

=

await supabase

.from("notifications")

.update({

is_read:true

})

.eq(

"id",

notificationId

)

.select()

.single();


if(error) throw error;

return data;

}


// MARK ALL AS READ

export async function markAllAsRead(

userId

){

const { error }

=

await supabase

.from("notifications")

.update({

is_read:true

})

.eq(

"user_id",

userId

);


if(error) throw error;

}


// DELETE ONE

export async function deleteNotification(

notificationId

){

const { error }

=

await supabase

.from("notifications")

.delete()

.eq(

"id",

notificationId

);


if(error) throw error;

}


// CLEAR ALL

export async function clearNotifications(

userId

){

const { error }

=

await supabase

.from("notifications")

.delete()

.eq(

"user_id",

userId

);


if(error) throw error;

}