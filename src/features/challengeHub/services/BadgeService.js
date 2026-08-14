// services/BadgeService.js

import { RewardEvents } from "../events/RewardEvents.js";

export class BadgeService {
  constructor({ badgeRepo, userRepo, eventBus }) {
    this.badgeRepo = badgeRepo;
    this.userRepo = userRepo;
    this.eventBus = eventBus;
  }

  register() {
    this.eventBus.subscribe(
      RewardEvents.LEVEL_UP,
      this.handleLevelUp.bind(this)
    );
  }

  async handleLevelUp(event) {
    const { userId, level } = event;

    const badges = [];

    if (level >= 5) badges.push("LEVEL_5");
    if (level >= 10) badges.push("LEVEL_10");

    for (const badge of badges) {
      const alreadyHas = await this.badgeRepo.has(userId, badge);

      if (!alreadyHas) {
        await this.badgeRepo.assign(userId, badge);

        await this.eventBus.publish(
          RewardEvents.BADGE_UNLOCKED,
          { userId, badge }
        );
      }
    }
  }
}