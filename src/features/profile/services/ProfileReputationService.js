import { normalizeProfileReputation } from "../utils/normalizeProfileReputation";

export const ProfileReputationService = {
  normalize(raw) {
    return normalizeProfileReputation(raw);
  },
};