import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  hasPermission,
} from "../middleware/permission.js";

import * as workspaceController
from "../controllers/workspaceController.js";

const router =
  express.Router();

/*
============================
WORKSPACES
============================
*/

router.post(
  "/",
  authMiddleware,
  workspaceController.create
);

router.get(
  "/",
  authMiddleware,
  workspaceController.getMyWorkspaces
);

router.get(
  "/:id",
  authMiddleware,
  workspaceController.getWorkspace
);

/*
============================
INVITES
============================
*/

router.post(
  "/:workspaceId/invite",
  authMiddleware,

  hasPermission(
    "member.invite"
  ),

  workspaceController.inviteMember
);

router.post(
  "/accept/:token",
  authMiddleware,
  workspaceController.acceptInvite
);

/*
============================
MEMBERS
============================
*/

router.delete(
  "/:workspaceId/member/:userId",

  authMiddleware,

  hasPermission(
    "member.remove"
  ),

  workspaceController.removeMember
);

router.patch(
  "/:workspaceId/member/:userId/role",

  authMiddleware,

  hasPermission(
    "member.invite"
  ),

  workspaceController.updateRole
);

router.get(
  "/:workspaceId/dashboard",

  authMiddleware,

  workspaceController.dashboard
);
export default router;