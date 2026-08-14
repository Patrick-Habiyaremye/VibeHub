import { createProfileReputationModel } from "../models/ProfileReputationModel";

export function normalizeProfileReputation(raw) {
  return createProfileReputationModel(raw || {});
}