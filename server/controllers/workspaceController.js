import crypto from "crypto";

import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import WorkspaceInvite from "../models/WorkspaceInvite.js";

import * as workspaceService from "../services/workspaceService.js";

import { logActivity } from "../services/auditService.js";

/*
=================================
CREATE
=================================
*/

export const create = async (
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
      workspace: workspace._id,
      user: req.userId,
      action: "WORKSPACE_CREATED",
      resourceType: "workspace",
      resourceId: workspace._id,
    });

    res.status(201).json({
      success: true,
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=================================
GET MY WORKSPACES
=================================
*/

export const getMyWorkspaces =
async (req, res) => {
  try {

    const workspaces =
      await workspaceService.getUserWorkspaces(
        req.userId
      );

    res.json({
      success: true,
      workspaces,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

/*
=================================
GET ONE
=================================
*/

export const getWorkspace =
async (req, res) => {

  try {

    const workspace =
      await workspaceService.getWorkspace(
        req.params.id
      );

    if (!workspace) {
      return res.status(404).json({
        success: false,
      });
    }

    res.json({
      success: true,
      workspace,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

/*
=================================
INVITE MEMBER
=================================
*/

export const inviteMember =
async (req, res) => {

  try {

    const {
      email,
      role,
    } = req.body;

    const token =
      crypto.randomBytes(32)
        .toString("hex");

    const invite =
      await WorkspaceInvite.create({
        workspace:
          req.params.workspaceId,

        invitedBy:
          req.userId,

        email,

        role,

        token,

        expiresAt:
          new Date(
            Date.now() +
            1000 *
            60 *
            60 *
            24 *
            7
          ),
      });

    await logActivity({
      workspace:
        req.params.workspaceId,

      user:
        req.userId,

      action:
        "MEMBER_INVITED",

      resourceType:
        "invite",

      resourceId:
        invite._id,

      metadata: {
        email,
        role,
      },
    });

    res.json({
      success: true,
      invite,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message:
        error.message,
    });

  }
};

/*
=================================
ACCEPT INVITE
=================================
*/

export const acceptInvite =
async (req, res) => {

  try {

    const invite =
      await WorkspaceInvite.findOne({
        token:
          req.params.token,
      });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message:
          "Invite not found",
      });
    }

    if (
      invite.status !==
      "pending"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invite invalid",
      });
    }

    await workspaceService.addMember(
      invite.workspace,
      req.userId,
      invite.role
    );

    invite.status =
      "accepted";

    await invite.save();

    res.json({
      success: true,
      message:
        "Joined workspace",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message:
        error.message,
    });

  }
};

/*
=================================
REMOVE MEMBER
=================================
*/

export const removeMember =
async (req, res) => {

  try {

    await workspaceService.removeMember(
      req.params.workspaceId,
      req.params.userId
    );

    res.json({
      success: true,
      message:
        "Member removed",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message:
        error.message,
    });

  }
};

/*
=================================
CHANGE ROLE
=================================
*/

export const updateRole =
async (req, res) => {

  try {

    await workspaceService.updateMemberRole(
      req.params.workspaceId,
      req.params.userId,
      req.body.role
    );

    res.json({
      success: true,
      message:
        "Role updated",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message:
        error.message,
    });

  }
};

export const dashboard =
async (req, res) => {

  try {

    const workspace =
      await Workspace.findById(
        req.params.workspaceId
      )
      .populate("projects")
      .populate("components")
      .populate("assets");

    res.json({
      success: true,

      stats: {

        members:
          workspace.members.length,

        projects:
          workspace.projects.length,

        components:
          workspace.components.length,

        assets:
          workspace.assets.length,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message:
        error.message,
    });

  }
};