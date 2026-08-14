// services/XPService.js

// export class XPService {
//   constructor({ userRepo, eventBus }) {
//     this.userRepo = userRepo;
//     this.eventBus = eventBus;
//   }

//   async handleRewardGranted(event) {
//     const { userId, xp } = event;

//     const user = await this.userRepo.getById(userId);

//     user.xp += xp;

//     const newLevel = this.calculateLevel(user.xp);

//     if (newLevel > user.level) {
//       user.level = newLevel;

//       await this.eventBus.publish("LEVEL_UP", {
//         userId,
//         level: newLevel,
//       });
//     }

//     await this.userRepo.update(user);
//   }

//   calculateLevel(xp) {
//     // exponential growth curve
//     return Math.floor(0.1 * Math.sqrt(xp));
//   }
// }

// services/XPService.js

import { RewardEvents } from "../events/RewardEvents.js";

export class XPService {
  constructor({ userRepo, eventBus }) {
    this.userRepo = userRepo;
    this.eventBus = eventBus;
  }

  register() {
    this.eventBus.subscribe(
      RewardEvents.SCORE_UPDATED,
      this.handleScore.bind(this)
    );
  }

  async handleScore(event) {
    const { userId, points } = event;

    const xp = points; // simple mapping (can evolve later)

    await this.userRepo.addXP(userId, xp);

    await this.eventBus.publish(RewardEvents.XP_GAINED, {
      userId,
      xp,
    });
  }
}