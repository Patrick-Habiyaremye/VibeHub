import express from "express";

import { ChallengeController } 
from "../controllers/challenge.controller.js";


export default function challengeRoutes({
 challengeController
}){

const router = express.Router();


router.get(
 "/",
 challengeController.getAll
);


router.get(
 "/:id",
 challengeController.getById
);


router.post(
 "/:id/start",
 challengeController.start
);


router.post(
 "/:id/progress",
 challengeController.progress
);


router.post(
 "/:id/complete",
 challengeController.complete
);


router.post(
 "/submit",
 challengeController.submit
);


return router;

}