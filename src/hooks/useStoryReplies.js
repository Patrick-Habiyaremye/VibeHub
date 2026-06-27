import { supabase } from "../supabaseClient";

export default function useStoryReplies(user) {
  const replyToStory = async (story, text) => {
    if (!user?.id) return;

    await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: story.user_id,
      content: text,
      story_id: story.id,
    });
  };

  const reactToStory = async (story, reaction) => {
    await supabase.from("smile_moment_reactions").insert({
      moment_id: story.id,
      user_id: user.id,
      reaction,
    });
  };

  return { replyToStory, reactToStory };
}