// services/RewardEngine.js

// export class RewardEngine {
//   constructor({ rewardRepo, eventBus }) {
//     this.rewardRepo = rewardRepo;
//     this.eventBus = eventBus;
//   }

//   async handleProgressCompleted(event) {
//     const { userId, challengeId, progress } = event;

//     const baseXP = 50; // should come from challenge config
//     const difficultyMultiplier = 1; // fetch from DB later

//     let xp = baseXP * difficultyMultiplier;

//     // Adjust by validation confidence
//     if (progress.confidence) {
//       xp *= progress.confidence;
//     }

//     xp = Math.floor(xp);

//     const reward = {
//       userId,
//       challengeId,
//       xp,
//       reputation: xp * 0.5,
//       coins: Math.floor(xp / 10),
//     };

//     await this.rewardRepo.create(reward);

//     await this.eventBus.publish("REWARD_GRANTED", reward);
//   }
// }


// services/RewardEngine.js

import { ChallengeEvents } from "../events/ChallengeEvents.js";

export class RewardEngine {
  constructor({ rewardRepo, eventBus }) {
    this.rewardRepo = rewardRepo;
    this.eventBus = eventBus;
  }

  register() {
    this.eventBus.subscribe(
      ChallengeEvents.CHALLENGE_COMPLETED,
      this.handleCompletion.bind(this)
    );
  }

  async handleCompletion(event) {
    const { userId, challengeId } = event;

    const reward = "COINS_50";

    await this.rewardRepo.grantReward(userId, reward);

    await this.eventBus.publish("REWARD_GRANTED", {
      userId,
      reward,
      challengeId,
    });
  }
}