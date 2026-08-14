// adapters/mapMediaToPost.js

export function mapMediaToPost({ media, user }) {
  return {
    id: `temp-${Date.now()}`, // optimistic ID
    user_id: user.id,
    media_url: media.url,
    media_type: media.type,
    caption: "",
    created_at: new Date().toISOString(),
    optimistic: true,
  };
}