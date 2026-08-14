// repositories/scoreRepo.js

export class ScoreRepo {
  constructor(db) {
    this.db = db;
  }

  async addScore(userId, points) {
    return this.db("scores").insert({ user_id: userId, points });
  }

  async getUserScore(userId) {
    const rows = await this.db("scores")
      .where({ user_id: userId });

    return rows.reduce((sum, r) => sum + r.points, 0);
  }
}