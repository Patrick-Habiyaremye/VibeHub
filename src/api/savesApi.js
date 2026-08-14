// api/savesApi.js
//
// CHANGES: contentType now validated against a whitelist before touching
// Supabase (§2) — an invalid string throws immediately instead of
// silently reaching the DB (where the CHECK constraint would catch it
// anyway, but that's a wasted round trip and a worse error message).
// getSavedContent's cursor is now a composite {createdAt, id} object
// instead of a bare timestamp — fixes the same-timestamp pagination gap
// from §11/TEST 12. user_id is still NEVER accepted as a parameter
// anywhere in this file — unchanged from before.

import { supabase } from "../supabaseClient";

export const SAVE_CONTENT_TYPES = {
  POST: "post",
  REEL: "reel",
  MOMENT: "moment",
};

const VALID_CONTENT_TYPES = new Set(Object.values(SAVE_CONTENT_TYPES));

function assertValidContentType(contentType) {
  if (!VALID_CONTENT_TYPES.has(contentType)) {
    throw new Error(`Invalid content type: "${contentType}"`);
  }
}

async function getAuthUserId() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("You must be signed in to save content.");
  return user.id;
}

export async function saveContent({ contentType, contentId }) {
  assertValidContentType(contentType);
  if (!contentId) throw new Error("contentId is required.");
  const userId = await getAuthUserId();

  const { error } = await supabase
    .from("saves")
    .insert({ user_id: userId, content_type: contentType, content_id: contentId });

  // Unique-violation means the desired end state (saved=true) is already
  // true — not a caller-facing error.
  if (error && error.code !== "23505") throw error;
  return true;
}

export async function unsaveContent({ contentType, contentId }) {
  assertValidContentType(contentType);
  if (!contentId) throw new Error("contentId is required.");
  const userId = await getAuthUserId();

  const { error } = await supabase
    .from("saves")
    .delete()
    .eq("user_id", userId)
    .eq("content_type", contentType)
    .eq("content_id", contentId);

  if (error) throw error;
  return true;
}

export async function isContentSaved({ contentType, contentId }) {
  assertValidContentType(contentType);
  const userId = await getAuthUserId();

  const { data, error } = await supabase
    .from("saves")
    .select("id")
    .eq("user_id", userId)
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

/** Bulk fetch — see useSaves.js for why this is called once per user session. */
export async function getMySaves() {
  const userId = await getAuthUserId();

  const { data, error } = await supabase
    .from("saves")
    .select("content_type, content_id")
    .eq("user_id", userId);

  if (error) throw error;
  return data ?? [];
}

/**
 * Keyset-paginated saves. `cursor`, when provided, must be the exact
 * { createdAt, id } object returned as `nextCursor` from the previous
 * call — not a bare timestamp. This is what makes identical-timestamp
 * rows resolve deterministically (§11): the second ORDER BY column (id)
 * breaks the tie, and the cursor carries both so the next page's WHERE
 * clause can express "strictly after this exact row", not just "after
 * this timestamp".
 */
export async function getSavedContent({ contentType = null, limit = 12, cursor = null }) {
  if (contentType) assertValidContentType(contentType);
  const userId = await getAuthUserId();

  let query = supabase
    .from("saves")
    .select("id, content_type, content_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  if (contentType) query = query.eq("content_type", contentType);

  if (cursor?.createdAt && cursor?.id) {
    // created_at < cursor.createdAt  OR  (created_at = cursor.createdAt AND id < cursor.id)
    query = query.or(
      `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  const last = data?.[data.length - 1];

  return {
    data: data ?? [],
    nextCursor:
      data?.length === limit && last ? { createdAt: last.created_at, id: last.id } : null,
  };
}