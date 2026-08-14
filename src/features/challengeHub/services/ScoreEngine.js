// services/ScoreEngine.js

import { GameEvents } from "../events/GameEvents.js";

export class ScoreEngine {
  constructor({ scoreRepo, eventBus }) {
    this.scoreRepo = scoreRepo;
    this.eventBus = eventBus;
  }

  register() {
    this.eventBus.subscribe(
      GameEvents.ANSWER_SUBMITTED,
      this.handleAnswer.bind(this)
    );

    this.eventBus.subscribe(
      GameEvents.GAME_FINISHED,
      this.handleGameFinished.bind(this)
    );
  }

  async handleAnswer(event) {
    const { userId, isCorrect } = event.payload;

    const points = isCorrect ? 10 : 0;

    if (points > 0) {
      await this.scoreRepo.addScore(userId, points);

      await this.eventBus.publish("SCORE_UPDATED", {
        userId,
        points,
      });
    }
  }

  async handleGameFinished(event) {
    const { userId } = event.payload;

    const totalScore = await this.scoreRepo.getUserScore(userId);

    await this.eventBus.publish("GAME_SCORE_FINALIZED", {
      userId,
      totalScore,
    });
  }
}