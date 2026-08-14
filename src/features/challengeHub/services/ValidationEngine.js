// services/ValidationEngine.js

// import crypto from "crypto";

// export class ValidationEngine {
//   constructor({ submissionRepo, userRepo }) {
//     this.submissionRepo = submissionRepo;
//     this.userRepo = userRepo;
//   }

//   async validate(submission) {
//     const errors = [];

//     // 1. Basic validation
//     if (!submission.userId) errors.push("Missing userId");
//     if (!submission.challengeId) errors.push("Missing challengeId");

//     if (errors.length) {
//       return { valid: false, errors };
//     }

//     // 2. Duplicate detection (simple hash)
//     const hash = this.generateHash(submission);

//     const existing = await this.submissionRepo.findByHash(hash);
//     if (existing) {
//       return {
//         valid: false,
//         reason: "DUPLICATE_SUBMISSION",
//       };
//     }

//     // 3. Rate limiting (anti-spam)
//     const recentCount = await this.submissionRepo.countRecent(
//       submission.userId,
//       10 // last 10 minutes
//     );

//     if (recentCount > 5) {
//       return {
//         valid: false,
//         reason: "RATE_LIMIT_EXCEEDED",
//       };
//     }

//     // 4. Reputation-based confidence
//     const user = await this.userRepo.getById(submission.userId);

//     let confidence = 0.5;

//     if (user.reputation > 1000) confidence += 0.3;
//     if (user.reputation > 5000) confidence += 0.2;

//     // 5. Content heuristics
//     if (submission.text && submission.text.length > 50) {
//       confidence += 0.1;
//     }

//     return {
//       valid: true,
//       confidence: Math.min(confidence, 1),
//       hash,
//     };
//   }

//   generateHash(submission) {
//     const content = JSON.stringify({
//       text: submission.text,
//       media: submission.mediaUrl,
//     });

//     return crypto.createHash("sha256").update(content).digest("hex");
//   }
// }

// services/ValidationEngine.js

export class ValidationEngine {
  constructor({ validators }) {
    this.validators = validators;
  }

  validate({ type, input, correctAnswer }) {
    const validator = this.validators[type];

    if (!validator) {
      throw new Error(`No validator for type: ${type}`);
    }

    return validator(input, correctAnswer);
  }
}