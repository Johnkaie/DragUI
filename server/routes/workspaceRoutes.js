import express from "express";

import authMiddleware
from "../middleware/auth.middleware.js";

import * as workspaceController
from "../controllers/workspaceController.js";

const router =
  express.Router();

router.post(
  "/",
  authMiddleware,
  workspaceController.create
);

export default router;