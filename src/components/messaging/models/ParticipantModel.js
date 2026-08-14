// src/features/messaging/models/ParticipantModel.js

export default class ParticipantModel {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.username = data.username ?? "";
    this.name = data.name ?? "";
    this.avatarUrl = data.avatarUrl ?? data.avatar_url ?? null;
    this.isOnline = Boolean(
      data.isOnline ?? data.is_online ?? false
    );
    this.lastSeen = data.lastSeen ?? data.last_seen ?? null;
  }

  get displayName() {
    return this.name || this.username || "User";
  }

  get initials() {
    return this.displayName
      .trim()
      .slice(0, 1)
      .toUpperCase();
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      name: this.name,
      avatarUrl: this.avatarUrl,
      isOnline: this.isOnline,
      lastSeen: this.lastSeen,
    };
  }
}