// utils/challengeTypes.js

export const ChallengeTypes = Object.freeze({
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  ONE_TIME: "ONE_TIME",
  STREAK: "STREAK",
  COMMUNITY: "COMMUNITY",
});

export const ChallengeTypeConfig = {
  DAILY: {
    maxSubmissions: 1,
    resetInterval: "24h",
    requiresProof: true,
  },
  WEEKLY: {
    maxSubmissions: 3,
    resetInterval: "7d",
    requiresProof: true,
  },
  ONE_TIME: {
    maxSubmissions: 1,
    resetInterval: null,
    requiresProof: true,
  },
  STREAK: {
    maxSubmissions: 1,
    resetInterval: "24h",
    requiresProof: false,
  },
  COMMUNITY: {
    maxSubmissions: 10,
    resetInterval: "24h",
    requiresProof: true,
  },
};

export const isValidChallengeType = (type) => {
  return Object.values(ChallengeTypes).includes(type);
};// utils/challengeTypes.js

export const ChallengeTypes = Object.freeze({
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  ONE_TIME: "ONE_TIME",
  STREAK: "STREAK",
  COMMUNITY: "COMMUNITY",
});

export const ChallengeTypeConfig = {
  DAILY: {
    maxSubmissions: 1,
    resetInterval: "24h",
    requiresProof: true,
  },
  WEEKLY: {
    maxSubmissions: 3,
    resetInterval: "7d",
    requiresProof: true,
  },
  ONE_TIME: {
    maxSubmissions: 1,
    resetInterval: null,
    requiresProof: true,
  },
  STREAK: {
    maxSubmissions: 1,
    resetInterval: "24h",
    requiresProof: false,
  },
  COMMUNITY: {
    maxSubmissions: 10,
    resetInterval: "24h",
    requiresProof: true,
  },
};

export const isValidChallengeType = (type) => {
  return Object.values(ChallengeTypes).includes(type);
};