// Reputation + achievements are already embedded in ProfileController's
// getFullProfile response (reputation, achievements). This module exists so
// callers ask a reputation-shaped question rather than reaching into the
// raw profile payload, and so a future dedicated endpoint is a one-file swap.
export const profileReputationApi = {
  fromFullProfile(fullProfileResponse) {
    return {
      ...(fullProfileResponse?.reputation || {}),
      achievements: fullProfileResponse?.achievements || { unlocked: [] },
    };
  },
};