import express from "express";

import {
  registerAdmin,
  loginAdmin,
  getProfile,
} from "../controllers/adminAuthController.js";

import adminAuth
from "../middleware/adminAuth.js";

const router =
  express.Router();

router.post(
  "/register",
  registerAdmin
);

router.post(
  "/login",
  loginAdmin
);

router.get(
  "/profile",
  adminAuth,
  getProfile
);

export default router;