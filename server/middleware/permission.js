import Workspace from "../models/Workspace.js";

import {
  PERMISSIONS,
} from "../constants/roles.js";

export const hasPermission =
(permission) =>
async (
  req,
  res,
  next
) => {

  try {

    const workspaceId =
      req.params.workspaceId ||
      req.body.workspaceId ||
      req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400)
        .json({
          success:false,
          message:
            "Workspace required",
        });
    }

    const workspace =
      await Workspace.findById(
        workspaceId
      );

    if (!workspace) {
      return res.status(404)
        .json({
          success:false,
          message:
            "Workspace not found",
        });
    }

    const member =
      workspace.members.find(
        (m) =>
          m.user.toString() ===
          req.userId.toString()
      );

    if (!member) {
      return res.status(403)
        .json({
          success:false,
          message:
            "Not workspace member",
        });
    }

    const permissions =
      PERMISSIONS[
        member.role.toUpperCase()
      ];

    if (
      permissions.includes("*")
    ) {
      req.workspace =
        workspace;

      req.workspaceRole =
        member.role;

      return next();
    }

    if (
      !permissions.includes(
        permission
      )
    ) {
      return res.status(403)
        .json({
          success:false,
          message:
            "Permission denied",
        });
    }

    req.workspace =
      workspace;

    req.workspaceRole =
      member.role;

    next();

  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }

};