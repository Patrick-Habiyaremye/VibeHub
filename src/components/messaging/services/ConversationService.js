import { supabase } from "../../../supabaseClient";

export default class ConversationService {
  async getOrCreateDirectConversation(
    currentUserId,
    otherUserId
  ) {
    if (!currentUserId || !otherUserId) {
      throw new Error("Both users are required");
    }

    if (currentUserId === otherUserId) {
      throw new Error("You cannot message yourself");
    }

    const { data, error } = await supabase.rpc(
      "get_or_create_direct_conversation",
      {
        p_user_a: currentUserId,
        p_user_b: otherUserId,
      }
    );

    if (error) throw error;

    return data;
  }
}