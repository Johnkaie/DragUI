import mongoose from "mongoose";

const auditLogSchema =
new mongoose.Schema(
{
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace"
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  action: {
    type: String,
    required: true
  },

  resourceType: {
    type: String,
    enum: [
      "workspace",
      "project",
      "component",
      "asset",
      "member",
      "invite"
    ]
  },

  resourceId: String,

  metadata: {
    type: Object,
    default: {}
  },

  ipAddress: String,

  userAgent: String
},
{
  timestamps: true
}
);

auditLogSchema.index({
  workspace: 1,
  createdAt: -1
});

auditLogSchema.index({
  user: 1,
  createdAt: -1
});

export default mongoose.model(
  "AuditLog",
  auditLogSchema
);