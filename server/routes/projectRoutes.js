import express from "express";

import authMiddleware
from "../middleware/auth.middleware.js";

import * as projectController
from "../controllers/projectController.js";

const router =
 express.Router();

router.post(
 "/",
 authMiddleware,
 projectController.create
);

router.get(
 "/:projectId",
 projectController.getOne
);

export default router;