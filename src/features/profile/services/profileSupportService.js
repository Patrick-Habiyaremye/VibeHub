import { supabase } from "../../../supabaseClient";

/**
 * Get creator-level support statistics for a profile.
 *
 * supporters:
 *   people supporting this profile
 *
 * supporting:
 *   people this profile supports
 */
export async function getProfileSupportStats(profileId) {
  if (!profileId) {
    return {
      supportersCount: 0,
      supportingCount: 0,
    };
  }

  const [supportersResult, supportingResult] = await Promise.all([
    supabase
      .from("supporters")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("supported_user_id", profileId),

    supabase
      .from("supporters")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("supporter_id", profileId),
  ]);

  if (supportersResult.error) {
    throw supportersResult.error;
  }

  if (supportingResult.error) {
    throw supportingResult.error;
  }

  return {
    supportersCount: supportersResult.count ?? 0,
    supportingCount: supportingResult.count ?? 0,
  };
}