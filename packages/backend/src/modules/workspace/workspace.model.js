import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner User ID is required'],
    },
  },
  {
    timestamps: true,
  },
);

const workspaceMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
      required: [true, 'Role is required'],
    },
    permissionOverrides: {
      grant: {
        type: [String],
        default: [],
      },
      deny: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  },
);

// Ensure a user can only have one membership per workspace
workspaceMemberSchema.index({ userId: 1, workspaceId: 1 }, { unique: true });

export const Workspace = mongoose.model('Workspace', workspaceSchema);
export const WorkspaceMember = mongoose.model('WorkspaceMember', workspaceMemberSchema);
