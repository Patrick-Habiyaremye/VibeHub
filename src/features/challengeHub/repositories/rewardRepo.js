// repositories/rewardRepo.js

export class RewardRepo {
  constructor(db) {
    this.db = db;
  }

  async grantReward(userId, reward) {
    return this.db("rewards").insert({
      user_id: userId,
      reward,
    });
  }
}