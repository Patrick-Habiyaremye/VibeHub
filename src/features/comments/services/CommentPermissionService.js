// src/features/comments/services/CommentPermissionService.js
//
// ASSUMPTION FLAGGED: canParticipate checks `user?.profile?.banned` —
// I don't know whether your AuthContext's `user` object merges the
// `profiles` row (which does have a `banned` column, confirmed in your
// schema) onto the auth user, or keeps them separate. If `user.profile`
// doesn't exist on your AuthContext shape, this check silently no-ops
// (treats everyone as not banned) rather than throwing — safe default,
// but tell me the real shape and I'll wire it correctly.

export default class CommentPermissionService {
  static canParticipate(user) {
    if (!user) return false;
    if (user.profile?.banned) return false;
    return true;
  }

  static canModify(comment, user) {
    return !!user?.id && user.id === comment.userId;
  }
}