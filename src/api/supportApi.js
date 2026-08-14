// FILE: src/api/supportApi.js

import { supabase } from "../supabaseClient";

async function getAuthUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");
  return user;
}

/**
 * Is the current user supporting this creator?
 */
export async function isSupporting(creatorId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id === creatorId) return false;

  const { data, error } = await supabase
    .from("supporters")
    .select("id")
    .eq("supporter_id", user.id)
    .eq("supported_user_id", creatorId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

/**
 * Toggle support for a creator. Returns { supporting: boolean }.
 */
export async function toggleSupport(creatorId) {
  const user = await getAuthUser();

  if (user.id === creatorId) {
    throw new Error("You can't support yourself.");
  }

  const { data: existing, error: checkError } = await supabase
    .from("supporters")
    .select("id")
    .eq("supporter_id", user.id)
    .eq("supported_user_id", creatorId)
    .maybeSingle();

  if (checkError) throw checkError;

  if (existing) {
    const { error } = await supabase
      .from("supporters")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    return { supporting: false };
  }

  const { error } = await supabase.from("supporters").insert({
    supporter_id: user.id,
    supported_user_id: creatorId,
  });
  if (error) throw error;
  return { supporting: true };
}

export async function getSupporterCount(creatorId) {
  const { count, error } = await supabase
    .from("supporters")
    .select("*", { head: true, count: "exact" })
    .eq("supported_user_id", creatorId);
  if (error) throw error;
  return count ?? 0;
}

export async function getSupportingCount(userId) {
  const { count, error } = await supabase
    .from("supporters")
    .select("*", { head: true, count: "exact" })
    .eq("supporter_id", userId);
  if (error) throw error;
  return count ?? 0;
}