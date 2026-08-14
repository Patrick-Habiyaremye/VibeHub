export class ChallengeRepo {
  constructor(db) {
    this.db = db;
  }

  async updateProgress(userId, challengeId, progress) {
    return this.db("challenge_progress")
      .where({
        user_id: userId,
        challenge_id: challengeId,
      })
      .update({ progress });
  }

  async complete(userId, challengeId) {
    return this.db("challenge_progress")
      .where({
        user_id: userId,
        challenge_id: challengeId,
      })
      .update({
        status: "completed",
        progress: 100,
      });
  }
}