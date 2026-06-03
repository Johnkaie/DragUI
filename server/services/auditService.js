import AuditLog from "../models/AuditLog.js";

export const logActivity = async ({
  workspace,
  user,
  action,
  resourceType,
  resourceId,
  metadata = {},
  ipAddress,
  userAgent,
}) => {
  try {
    await AuditLog.create({
      workspace,
      user,
      action,
      resourceType,
      resourceId,
      metadata,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error(
      "Audit Log Error:",
      error.message
    );
  }
};

export const getWorkspaceLogs =
async (
  workspaceId,
  page = 1,
  limit = 50
) => {

  const skip =
    (page - 1) * limit;

  return AuditLog.find({
    workspace: workspaceId,
  })
    .populate(
      "user",
      "username email avatar"
    )
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(limit);

};