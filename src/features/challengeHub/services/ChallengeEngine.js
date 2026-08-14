// services/ChallengeEngine.js

export class ChallengeEngine {
  constructor({
    validationEngine,
    challengeService,
    submissionRepo,
    rewardService,
    eventBus,
  }) {
    this.validationEngine = validationEngine;
    this.challengeService = challengeService;
    this.submissionRepo = submissionRepo;
    this.rewardService = rewardService;
    this.eventBus = eventBus;
  }

  /* --------------------------------------------------
     START CHALLENGE
  ---------------------------------------------------*/
  async start({ userId, challengeId }) {
    const progress =
      await this.challengeService.getUserProgress(
        challengeId,
        userId
      );

    if (progress) {
      throw new Error("Challenge already started");
    }

    const created =
      await this.challengeService.createProgress({
        challengeId,
        userId,
      });

    await this.eventBus.publish("CHALLENGE_STARTED", {
      userId,
      challengeId,
    });

    return created;
  }

  /* --------------------------------------------------
     UPDATE PROGRESS
  ---------------------------------------------------*/
  async progress({ userId, challengeId, progress }) {
    const existing =
      await this.challengeService.getUserProgress(
        challengeId,
        userId
      );

    if (!existing) {
      throw new Error("Challenge not started");
    }

    if (existing.status === "completed") {
      throw new Error("Already completed");
    }

    // 🔒 Anti-cheat guard
    if (progress > 100) {
      throw new Error("Invalid progress value");
    }

    const updated =
      await this.challengeService.updateProgress({
        id: existing.id,
        progress,
      });

    await this.eventBus.publish("CHALLENGE_PROGRESS", {
      userId,
      challengeId,
      progress,
    });

    return updated;
  }

  /* --------------------------------------------------
     COMPLETE CHALLENGE
  ---------------------------------------------------*/
  async complete({ userId, challengeId, proof }) {
    const existing =
      await this.challengeService.getUserProgress(
        challengeId,
        userId
      );

    if (!existing) {
      throw new Error("Challenge not started");
    }

    if (existing.status === "completed") {
      throw new Error("Already completed");
    }

    const challenge =
      await this.challengeService.getChallengeById(
        challengeId
      );

    const updated =
      await this.challengeService.completeProgress({
        id: existing.id,
        proof,
      });

    // 🎁 Reward logic centralized
    const reward =
      await this.rewardService.grantReward({
        userId,
        challenge,
      });

    await this.eventBus.publish("CHALLENGE_COMPLETED", {
      userId,
      challengeId,
      reward,
    });

    return {
      ...updated,
      reward,
    };
  }

  /* --------------------------------------------------
     SUBMIT (ADVANCED FLOW)
  ---------------------------------------------------*/
  async submit(submission) {
    // 1. Validate
    const result =
      await this.validationEngine.validate(submission);

    if (!result.valid) {
      return {
        success: false,
        reason: result.reason || result.errors,
      };
    }

    // 2. Save submission
    const saved = await this.submissionRepo.create({
      ...submission,
      hash: result.hash,
      confidence: result.confidence,
    });

    // 3. Auto-complete challenge after submission
    const completion = await this.complete({
      userId: submission.userId,
      challengeId: submission.challengeId,
      proof: submission.mediaUrl || submission.text,
    });

    // 4. Emit event
    await this.eventBus.publish("SUBMISSION_VALIDATED", {
      submission: saved,
    });

    return {
      success: true,
      submissionId: saved.id,
      completion,
    };
  }
}