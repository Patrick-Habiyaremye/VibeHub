// src/services/profileStatsService.js

import { supabase } from "../supabaseClient";
import { normalizeProfileStats } from "../features/profile/utils/normalizeProfileStats";

/* =========================================================
   ERROR HANDLER
========================================================= */

function handleError(operation, error, extra = {}) {
  console.error(`[profileStatsService.${operation}]`, {
    ...extra,
    message: error?.message || "",
    code: error?.code || "",
    details: error?.details || "",
    hint: error?.hint || "",
  });

  throw error;
}

/* =========================================================
   SUPPORTERS
========================================================= */

async function getSupportersCount(userId) {
  const { count, error } = await supabase
    .from("supporters")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("supported_user_id", userId);

  if (error) {
    handleError(
      "getSupportersCount",
      error,
      { userId }
    );
  }

  return count || 0;
}

/* =========================================================
   POSTS
========================================================= */

async function getPosts(userId) {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      id,
      user_id,
      content,
      media,
      created_at,
      smile_score,
      share_count,
      comments_count,
      style
    `)
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    handleError(
      "getPosts",
      error,
      { userId }
    );
  }

  return data || [];
}

/* =========================================================
   REELS
========================================================= */

async function getReels(userId) {
  const { data, error } = await supabase
    .from("reels")
    .select(`
      id,
      user_id,
      video_url,
      thumbnail_url,
      caption,
      tags,
      duration,
      views_count,
      likes_count,
      comments_count,
      shares_count,
      created_at,
      width,
      height
    `)
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    handleError(
      "getReels",
      error,
      { userId }
    );
  }

  return data || [];
}

/* =========================================================
   COMMENTS RECEIVED
========================================================= */

/*
  Your comments table does NOT have post_id/reel_id.

  It uses:

    content_type
    content_id

  Therefore we first get the user's posts/reels,
  then count comments whose content_id belongs to them.
*/

async function getCommentsReceived({
  posts = [],
  reels = [],
}) {
  const postIds = posts
    .map((post) => post?.id)
    .filter(Boolean);

  const reelIds = reels
    .map((reel) => reel?.id)
    .filter(Boolean);

  if (!postIds.length && !reelIds.length) {
    return 0;
  }

  let total = 0;

  /* -----------------------------------------
     POST COMMENTS
  ----------------------------------------- */

  if (postIds.length) {
    const { count, error } = await supabase
      .from("comments")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("content_type", "post")
      .in("content_id", postIds);

    if (error) {
      handleError(
        "getCommentsReceived.posts",
        error
      );
    }

    total += count || 0;
  }

  /* -----------------------------------------
     REEL COMMENTS
  ----------------------------------------- */

  if (reelIds.length) {
    const { count, error } = await supabase
      .from("comments")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("content_type", "reel")
      .in("content_id", reelIds);

    if (error) {
      handleError(
        "getCommentsReceived.reels",
        error
      );
    }

    total += count || 0;
  }

  return total;
}

/* =========================================================
   POST STATS
========================================================= */

function computePostStats(posts = []) {
  return posts.reduce(
    (stats, post) => {
      stats.postsCount += 1;

      stats.smilesReceived +=
        Number(post?.smile_score || 0);

      stats.sharesReceived +=
        Number(post?.share_count || 0);

      stats.commentsReceivedFromPosts +=
        Number(post?.comments_count || 0);

      return stats;
    },
    {
      postsCount: 0,
      smilesReceived: 0,
      sharesReceived: 0,
      commentsReceivedFromPosts: 0,
    }
  );
}

/* =========================================================
   REEL STATS
========================================================= */

function computeReelStats(reels = []) {
  return reels.reduce(
    (stats, reel) => {
      stats.reelsCount += 1;

      stats.viewsReceived +=
        Number(reel?.views_count || 0);

      stats.likesReceived +=
        Number(reel?.likes_count || 0);

      stats.commentsReceivedFromReels +=
        Number(reel?.comments_count || 0);

      stats.sharesReceived +=
        Number(reel?.shares_count || 0);

      return stats;
    },
    {
      reelsCount: 0,
      viewsReceived: 0,
      likesReceived: 0,
      commentsReceivedFromReels: 0,
      sharesReceived: 0,
    }
  );
}

/* =========================================================
   PURE COMPUTATION
========================================================= */

function computeStats({
  profile = null,
  posts = [],
  reels = [],
  supportersCount = 0,
  commentsReceived = 0,
}) {
  const postStats = computePostStats(posts);

  const reelStats = computeReelStats(reels);

  return normalizeProfileStats({
    profile,
    posts,
    reels,

    supportersCount,

    commentsReceived,

    ...postStats,
    ...reelStats,
  });
}

/* =========================================================
   MAIN PROFILE STATS
========================================================= */

export async function getProfileStats(userId) {
  if (!userId) {
    throw new Error(
      "getProfileStats requires a userId"
    );
  }

  try {
    /* -----------------------------------------
       Load profile + posts + reels + supporters
       in parallel.
    ----------------------------------------- */

    const [
      profileResult,
      posts,
      reels,
      supportersCount,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select(`
          id,
          username,
          avatar_url,
          bio,
          role,
          created_at,
          is_onboarded,
          full_name,
          streak_count,
          last_active_date,
          cover_image,
          banned,
          email
        `)
        .eq("id", userId)
        .single(),

      getPosts(userId),

      getReels(userId),

      getSupportersCount(userId),
    ]);

    const {
      data: profile,
      error: profileError,
    } = profileResult;

    if (profileError) {
      handleError(
        "getProfile",
        profileError,
        { userId }
      );
    }

    /* -----------------------------------------
       Comments depend on posts/reels.
    ----------------------------------------- */

    const commentsReceived =
      await getCommentsReceived({
        posts,
        reels,
      });

    /* -----------------------------------------
       Normalize everything.
    ----------------------------------------- */

    return computeStats({
      profile,
      posts,
      reels,
      supportersCount,
      commentsReceived,
    });
  } catch (error) {
    handleError(
      "getProfileStats",
      error,
      { userId }
    );
  }
}

/* =========================================================
   PUBLIC SERVICE
========================================================= */

export const ProfileStatsService = {
  getProfileStats,

  computeStats,
};

export default ProfileStatsService;