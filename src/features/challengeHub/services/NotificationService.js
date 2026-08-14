// services/NotificationService.js

// export class NotificationService {
//   constructor({ notificationRepo }) {
//     this.notificationRepo = notificationRepo;
//   }

//   async handleBadgeUnlocked(event) {
//     const { userId, badge } = event;

//     await this.notificationRepo.create({
//       userId,
//       type: "BADGE_UNLOCKED",
//       message: `You unlocked badge: ${badge}`,
//     });
//   }

//   async handleLevelUp(event) {
//     const { userId, level } = event;

//     await this.notificationRepo.create({
//       userId,
//       type: "LEVEL_UP",
//       message: `You reached level ${level}`,
//     });
//   }

//   async handleRewardGranted(event) {
//     const { userId, xp } = event;

//     await this.notificationRepo.create({
//       userId,
//       type: "REWARD",
//       message: `You earned ${xp} XP`,
//     });
//   }
// }


// services/NotificationService.js

import { RewardEvents } from "../events/RewardEvents.js";

export class NotificationService {
  constructor({ eventBus }) {
    this.eventBus = eventBus;
  }

  register() {
    this.eventBus.subscribe(
      RewardEvents.BADGE_UNLOCKED,
      this.notify.bind(this)
    );

    this.eventBus.subscribe(
      RewardEvents.LEVEL_UP,
      this.notify.bind(this)
    );
  }

  async notify(event) {
    console.log("🔔 Notification:", event);
  }
}