import * as workspaceService
from "../services/workspaceService.js";

import {
  logActivity,
} from "../services/auditService.js";

export const create =
async (
  req,
  res
) => {

  try {

    const workspace =
      await workspaceService.createWorkspace(
        req.body,
        req.userId
      );

    await logActivity({
      workspace:
        workspace._id,

      user:
        req.userId,

      action:
        "WORKSPACE_CREATED",

      resourceType:
        "workspace",

      resourceId:
        workspace._id,
    });

    res.status(201).json({
      success:true,
      workspace,
    });

  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }

};