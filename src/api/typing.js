// // api/typing.js

// import { supabase }
// from "../supabaseClient";

// export async function setTyping(
//   conversationKey,
//   userId,
//   isTyping
// ) {

//   await supabase
//     .from("typing_status")
//     .upsert({

//       conversation_key:
//         conversationKey,

//       user_id:
//         userId,

//       is_typing:
//         isTyping,

//       updated_at:
//         new Date()
//           .toISOString(),

//     });

// }

import { supabase } from "../supabaseClient";

export async function setTyping(
  conversationKey,
  userId,
  isTyping
) {
  const { error } = await supabase
    .from("typing_status")
    .upsert({
      conversation_key: conversationKey,
      user_id: userId,
      is_typing: isTyping,
      updated_at: new Date().toISOString(),
    });

  if (error) console.error(error);
}