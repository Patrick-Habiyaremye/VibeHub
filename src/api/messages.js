// api/messages.js

import { supabase } from "../supabaseClient";

export async function getMessages(
  senderId,
  receiverId
) {

  const { data, error } =
    await supabase
      .from("messages")
      .select("*")
      .or(
`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),
and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`
      )
      .order(
        "created_at",
        {
          ascending:true,
        }
      );

  if(error) throw error;

  return data;
}

export async function sendMessage(
  senderId,
  receiverId,
  content
){

const { data,error }
=
await supabase
.from("messages")
.insert({

sender_id:
senderId,

receiver_id:
receiverId,

content

})
.select()
.single();

if(error) throw error;

return data;

}

export async function markConversationSeen(senderId, receiverId) {
  const { data, error } = await supabase
    .from("messages")
    .update({ seen: true })
    .eq("sender_id", receiverId)
    .eq("receiver_id", senderId)
    .eq("seen", false);

  if (error) throw error;

  return data;
}