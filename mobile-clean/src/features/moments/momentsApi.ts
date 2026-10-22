import { supabase } from '../../lib/supabase';

export type MomentProfile = {
  username: string | null;
  avatar_url: string | null;
};

export type SmileMoment = {
  id: string;
  user_id: string;
  caption: string | null;
  media_url: string | null;
  media_type: string | null;
  music_url: string | null;
  music_title: string | null;
  music_artwork: string | null;
  bg_gradient: string | null;
  mood_tag: string | null;
  views_count: number | null;
  reactions_count: number | null;
  expires_at: string;
  created_at: string;
  profiles: MomentProfile | MomentProfile[] | null;
};

export type MomentGroup = {
  userId: string;
  username: string;
  avatarUrl: string | null;
  moments: SmileMoment[];
  latestMoment: SmileMoment;
};

export async function getSmileMoments(): Promise<SmileMoment[]> {
  const { data, error } = await supabase
    .from('smile_moments')
    .select('*, profiles:user_id(username, avatar_url)')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Couldn't load Smile Moments: ${error.message}`);
  }

  return (data ?? []) as unknown as SmileMoment[];
}

export function groupMomentsByUser(
  moments: SmileMoment[],
): MomentGroup[] {
  const groups = new Map<string, MomentGroup>();

  for (const moment of moments) {
    const profile = Array.isArray(moment.profiles)
      ? moment.profiles[0]
      : moment.profiles;

    const existing = groups.get(moment.user_id);

    if (existing) {
      // The API returns newest moments first, so append older moments.
      existing.moments.push(moment);
      continue;
    }

    groups.set(moment.user_id, {
      userId: moment.user_id,
      username: profile?.username || 'VibeHub member',
      avatarUrl: profile?.avatar_url ?? null,
      moments: [moment],
      latestMoment: moment,
    });
  }

  return Array.from(groups.values());
}