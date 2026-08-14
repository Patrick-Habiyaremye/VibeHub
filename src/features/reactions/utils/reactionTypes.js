// FILE: src/features/reactions/utils/reactionTypes.js

/**
 * =========================================================
 * VIBEHUB REACTION TYPES
 * =========================================================
 *
 * IMPORTANT:
 * These values MUST match the PostgreSQL
 * post_reactions.reaction CHECK constraint.
 *
 * Database values:
 *
 *   smile
 *   inspire
 *   respect
 *   hope
 *   kind
 *
 * Do not change these strings without updating
 * the database constraint and reaction RPC.
 * =========================================================
 */

export const REACTION_TYPES = Object.freeze({
  SMILE: "smile",
  INSPIRE: "inspire",
  RESPECT: "respect",
  HOPE: "hope",
  KIND: "kind",
});


/**
 * =========================================================
 * REACTION LIST
 * =========================================================
 *
 * This is the canonical list used by the UI.
 *
 * `type` is the value sent to Supabase.
 * `emoji` is the visual representation.
 * `label` is the accessible/user-facing name.
 */

export const REACTION_LIST = Object.freeze([
  Object.freeze({
    type: REACTION_TYPES.SMILE,
    emoji: "😊",
    label: "Smile",
  }),

  Object.freeze({
    type: REACTION_TYPES.INSPIRE,
    emoji: "💡",
    label: "Inspire",
  }),

  Object.freeze({
    type: REACTION_TYPES.RESPECT,
    emoji: "🙌",
    label: "Respect",
  }),

  Object.freeze({
    type: REACTION_TYPES.HOPE,
    emoji: "🌈",
    label: "Hope",
  }),

  Object.freeze({
    type: REACTION_TYPES.KIND,
    emoji: "💛",
    label: "Kind",
  }),
]);


/**
 * =========================================================
 * REACTION LOOKUP
 * =========================================================
 *
 * Allows:
 *
 * reactionMeta("smile")
 * reactionMeta("inspire")
 * reactionMeta("respect")
 * reactionMeta("hope")
 * reactionMeta("kind")
 */

export const REACTION_BY_TYPE = Object.freeze(
  REACTION_LIST.reduce((accumulator, reaction) => {
    accumulator[reaction.type] = reaction;

    return accumulator;
  }, {})
);


/**
 * =========================================================
 * VALIDATION
 * =========================================================
 */

export function isValidReactionType(type) {
  return (
    typeof type === "string" &&
    Object.values(REACTION_TYPES).includes(type)
  );
}


/**
 * =========================================================
 * REACTION METADATA
 * =========================================================
 *
 * Returns the metadata for a reaction.
 *
 * Invalid/unknown values safely fall back to Smile.
 */

export function reactionMeta(type) {
  return (
    REACTION_BY_TYPE[type] ??
    REACTION_BY_TYPE[REACTION_TYPES.SMILE]
  );
}


/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

/**
 * Return all canonical reaction values.
 *
 * Example:
 *
 * getReactionTypes()
 *
 * → [
 *     "smile",
 *     "inspire",
 *     "respect",
 *     "hope",
 *     "kind"
 *   ]
 */
export function getReactionTypes() {
  return REACTION_LIST.map(
    (reaction) => reaction.type
  );
}


/**
 * Check whether a reaction exists.
 */
export function hasReaction(type) {
  return isValidReactionType(type);
}


/**
 * Get the emoji for a reaction.
 */
export function getReactionEmoji(type) {
  return reactionMeta(type).emoji;
}


/**
 * Get the label for a reaction.
 */
export function getReactionLabel(type) {
  return reactionMeta(type).label;
}