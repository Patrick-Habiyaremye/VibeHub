import { supabase } from "../supabaseClient";
import normalizePost from "../utils/normalizePost";

/* ------------------------------------------
   AUTH
------------------------------------------ */

async function getAuthUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("User not authenticated");
  }
  
  return user;
}

/* ------------------------------------------
   VALIDATION
------------------------------------------ */

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function validateFile(file) {
  if (!file) return;

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File exceeds 10MB.");
  }

  if (
    !file.type.startsWith("image/") &&
    !file.type.startsWith("video/")
  ) {
    throw new Error("Unsupported file type.");
  }
}

function validatePost({ content, file, type }) {
  if (!content.trim() && !file) {
    throw new Error("Post cannot be empty.");
  }

  if (content.length > 5000) {
    throw new Error("Content is too long.");
  }

  if (!["quote", "image", "video"].includes(type)) {
    throw new Error("Invalid post type.");
  }
}

/* ------------------------------------------
   CREATE POST
------------------------------------------ */

export async function createPost({
  content = "",
  file = null,
  type = "quote",
  style = {},
}) {
  const user = await getAuthUser();

  validatePost({ content, file, type });

  let media = {
    kind: type,
    path: null,
    url: null,
  };

  let uploadedPath = null;

  try {
    /* ---------------- FILE UPLOAD ---------------- */
if (file) {
  validateFile(file);

  const extension =
    file.name.split(".").pop() || "bin";

  uploadedPath =
    `${user.id}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } =
    await supabase.storage
      .from("posts")
      .upload(uploadedPath, file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from("posts")
    .getPublicUrl(uploadedPath);

  media = {
    kind: type,
    path: uploadedPath,
    url: publicUrlData?.publicUrl ?? null,
  };
}

    /* ---------------- SAVE POST ---------------- */
    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        content: content.trim(),

        media,

        style: {
          background: style?.background || null,
        },
      })
      .select(`
        id,
        content,
        media,
        style,
        created_at,
        profiles(
          id,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) throw new Error(error.message);

    return normalizePost(data);
  } catch (err) {
    if (uploadedPath) {
      await supabase.storage
        .from("posts")
        .remove([uploadedPath]);
    }

    throw err;
  }
}

/* ------------------------------------------
   GET POSTS
------------------------------------------ */

export async function getPosts({
  userId,
  limit = 10,
  cursor = null,
}) {
  let query = supabase
    .from("posts")
    .select(`
      id,
      content,
      media,
      style,
      created_at,
      profiles(
        id,
        username,
        avatar_url
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data.map(normalizePost);
}

/* ------------------------------------------
   UPDATE POST
------------------------------------------ */

export async function updatePost(
  postId,
  updates
) {
  const user = await getAuthUser();

  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", postId)
    .eq("user_id", user.id)
    .select(`
      id,
      content,
      media,
      style,
      created_at,
      profiles(
        id,
        username,
        avatar_url
      )
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizePost(data);
}

/* ------------------------------------------
   DELETE POST
------------------------------------------ */

export async function deletePost(postId) {
  const user = await getAuthUser();

  const { data: post } = await supabase
    .from("posts")
    .select("media")
    .eq("id", postId)
    .single();

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  if (post?.media?.path) {
    await supabase.storage
      .from("posts")
      .remove([post.media.path]);
  }

  return true;
}