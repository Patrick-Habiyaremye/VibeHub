import { supabase } from '../../lib/supabase';

export type FeedPost = {
  id: string;
  user_id: string;
  content: string | null;
  created_at: string;
  media: unknown;
  profiles:
    | {
        username: string | null;
        avatar_url: string | null;
      }
    | null;
};

const PAGE_SIZE = 10;

export async function getFeedPosts(
  page = 0
): Promise<FeedPost[]> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(username, avatar_url)')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as FeedPost[];
}