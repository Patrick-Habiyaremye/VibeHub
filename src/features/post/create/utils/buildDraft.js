import { isValidPost, resolvePostType } from "../models/postModel";

export function buildDraft({
  content,
  media,
  mediaType,
  background,
  audience,
  currentUserId,
}) {
  const check = {
    text: content,
    media: media ? { file: media } : { url: null },
  };

  if (!isValidPost(check)) {
    throw new Error("Post cannot be empty.");
  }

  return {
    text: content,
    file: media,
    type: resolvePostType({
      text: content,
      media: media
        ? { file: media, type: mediaType }
        : { url: null },
    }),
    quoteStyle: media ? null : { background },
    audience,
    authorId: currentUserId,
  };
}