// FILE: src/api/reportsApi.js

import { supabase } from "../supabaseClient";

/**
 * @param {{ contentId: string, contentType: "post"|"reel"|"comment", reason: string, description?: string }} payload
 */
export async function reportContent({ contentId, contentType, reason, description = "" }) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("Authentication required");
  if (!contentId || !contentType) throw new Error("contentId and contentType are required");

  const { data, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: user.id,
      content_id: contentId,
      content_type: contentType,
      reason,
      description,
      status: "pending",
      resolved: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMyReports() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("reporter_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

