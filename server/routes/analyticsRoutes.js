import express from "express";

import adminAuth
from "../middleware/adminAuth.js";

import * as analyticsController
from "../controllers/analyticsController.js";

const router =
  express.Router();

router.get(
 "/dashboard",
 adminAuth,
 analyticsController.dashboard
);

export default router;