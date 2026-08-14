// src/features/messaging/normalizers/normalizeParticipant.js

import ParticipantModel from "../models/ParticipantModel";

export default function normalizeParticipant(
  participant
) {
  if (!participant) {
    return null;
  }

  const profile =
    Array.isArray(participant)
      ? participant[0]
      : participant;

  if (!profile?.id) {
    return null;
  }

  return new ParticipantModel({
    id: profile.id,

    username:
      profile.username ??
      "",

    name:
      profile.name ??
      "",

    avatar_url:
      profile.avatar_url ??
      null,

    is_online:
      profile.is_online ??
      false,

    last_seen:
      profile.last_seen ??
      null,
  });
}