// services/ProgressEngine.js

// export class ProgressEngine {
//   constructor({ progressRepo, eventBus }) {
//     this.progressRepo = progressRepo;
//     this.eventBus = eventBus;
//   }

//   async handleSubmissionValidated(event) {
//     const { submission } = event;

//     let progress = await this.progressRepo.get(
//       submission.userId,
//       submission.challengeId
//     );

//     if (!progress) {
//       progress = await this.progressRepo.create({
//         userId: submission.userId,
//         challengeId: submission.challengeId,
//         state: "IN_PROGRESS",
//         stepsCompleted: 0,
//       });
//     }

//     progress.stepsCompleted += 1;

//     // Assume single-step challenge for now
//     progress.state = "COMPLETED";
//     progress.completedAt = new Date();

//     await this.progressRepo.update(progress);

//     await this.eventBus.publish("PROGRESS_COMPLETED", {
//       userId: submission.userId,
//       challengeId: submission.challengeId,
//       progress,
//     });
//   }
// }


// services/ProgressEngine.js

import { GameEvents } from "../events/GameEvents.js";
import { ChallengeEvents } from "../events/ChallengeEvents.js";

export class ProgressEngine {
  constructor({ challengeService, eventBus }) {
    this.challengeService = challengeService;
    this.eventBus = eventBus;
  }

  register() {
    this.eventBus.subscribe(
      GameEvents.ANSWER_SUBMITTED,
      this.updateProgress.bind(this)
    );

    this.eventBus.subscribe(
      GameEvents.GAME_FINISHED,
      this.completeChallenge.bind(this)
    );
  }

  async updateProgress(event) {
    const { userId, challengeId } = event.payload;

    await this.challengeService.updateProgress({
      userId,
      challengeId,
      progress: 50, // example logic
    });

    await this.eventBus.publish(
      ChallengeEvents.CHALLENGE_PROGRESS_UPDATED,
      { userId, challengeId }
    );
  }

  async completeChallenge(event) {
    const { userId, challengeId } = event.payload;

    await this.challengeService.completeProgress({
      userId,
      challengeId,
    });

    await this.eventBus.publish(
      ChallengeEvents.CHALLENGE_COMPLETED,
      { userId, challengeId }
    );
  }
}