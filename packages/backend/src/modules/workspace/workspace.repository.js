import { Workspace, WorkspaceMember } from './workspace.model.js';

export class WorkspaceRepository {
  static async findWorkspaceById(workspaceId) {
    return Workspace.findById(workspaceId);
  }

  static async createWorkspace(data) {
    return Workspace.create(data);
  }

  static async findMember(userId, workspaceId) {
    return WorkspaceMember.findOne({ userId, workspaceId });
  }

  static async listMembers(workspaceId) {
    return WorkspaceMember.find({ workspaceId }).populate({
      path: 'userId',
      select: 'username email profilePictureUrlFullName fullName',
    });
  }

  static async addMember(data) {
    return WorkspaceMember.create(data);
  }

  static async removeMember(userId, workspaceId) {
    return WorkspaceMember.deleteOne({ userId, workspaceId });
  }

  static async updateMember(userId, workspaceId, updateData) {
    return WorkspaceMember.findOneAndUpdate({ userId, workspaceId }, updateData, { new: true });
  }
}
