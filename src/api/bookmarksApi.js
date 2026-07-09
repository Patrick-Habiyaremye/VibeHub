// import { supabase } from "../supabaseClient";

// async function getCurrentUser() {
//   const {
//     data: { user },
//     error,
//   } = await supabase.auth.getUser();

//   if (error) throw error;
//   if (!user) throw new Error("User is not authenticated.");

//   return user;
// }

// export async function getBookmarks() {
//   const user = await getCurrentUser();

//   const { data, error } = await supabase
//     .from("bookmarks")
//     .select(`
//       id,
//       post_id,
//       created_at,
//       posts (
//         *,
//         profiles (
//           id,
//           username,
//           avatar_url
//         )
//       )
//     `)
//     .eq("user_id", user.id)
//     .order("created_at", { ascending: false });

//   if (error) throw error;

//   return data ?? [];
// }

// export async function isBookmarked(postId) {
//   const user = await getCurrentUser();

//   const { data, error } = await supabase
//     .from("bookmarks")
//     .select("id")
//     .eq("user_id", user.id)
//     .eq("post_id", postId)
//     .maybeSingle();

//   if (error) throw error;

//   return !!data;
// }

// export async function addBookmark(postId) {
//   const user = await getCurrentUser();

//   const { data, error } = await supabase
//     .from("bookmarks")
//     .upsert(
//       {
//         user_id: user.id,
//         post_id: postId,
//       },
//       {
//         onConflict: "user_id,post_id",
//       }
//     )
//     .select()
//     .single();

//   if (error) throw error;

//   return data;
// }

// export async function removeBookmark(postId) {
//   const user = await getCurrentUser();

//   const { error } = await supabase
//     .from("bookmarks")
//     .delete()
//     .eq("user_id", user.id)
//     .eq("post_id", postId);

//   if (error) throw error;

//   return true;
// }

// export async function toggleBookmark(postId) {
//   const bookmarked = await isBookmarked(postId);

//   if (bookmarked) {
//     await removeBookmark(postId);
//     return {
//       bookmarked: false,
//       postId,
//     };
//   }

//   await addBookmark(postId);

//   return {
//     bookmarked: true,
//     postId,
//   };
// }

import { supabase } from "../supabaseClient";

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("Not authenticated");

  return user.id;
}

// GET ALL BOOKMARKS (single source of truth)
export async function getBookmarks() {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("bookmarks")
    .select("id, post_id, created_at")
    .eq("user_id", userId);

  if (error) throw error;

  return data ?? [];
}

// ADD
export async function addBookmark(postId) {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("bookmarks")
    .insert({
      user_id: userId,
      post_id: postId,
    });

  if (error) throw error;

  return { post_id: postId };
}

// REMOVE
export async function removeBookmark(postId) {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("post_id", postId);

  if (error) throw error;

  return { post_id: postId };
}