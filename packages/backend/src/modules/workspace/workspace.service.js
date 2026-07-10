import { WorkspaceRepository } from './workspace.repository.js';
import User from '#modules/user/user.model.js';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from '#shared/utils/errors.js';

export const getMembers = async (workspaceId) => {
  const members = await WorkspaceRepository.listMembers(workspaceId);
  return members.map((member) => {
    const memberObj = member.toObject();
    // Map populated user fields for cleaner response
    if (memberObj.userId) {
      memberObj.user = memberObj.userId;
      delete memberObj.userId;
    }
    return memberObj;
  });
};

export const inviteMember = async (workspaceId, email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new NotFoundError('Pengguna dengan email tersebut tidak ditemukan.');
  }

  const existingMember = await WorkspaceRepository.findMember(user._id, workspaceId);
  if (existingMember) {
    throw new ConflictError('Pengguna tersebut sudah terdaftar di workspace ini.');
  }

  const newMember = await WorkspaceRepository.addMember({
    userId: user._id,
    workspaceId,
    role: 'member',
  });

  return newMember;
};

export const removeMember = async (workspaceId, targetUserId) => {
  const membership = await WorkspaceRepository.findMember(targetUserId, workspaceId);
  if (!membership) {
    throw new NotFoundError('Anggota tidak ditemukan di workspace ini.');
  }

  if (membership.role === 'owner') {
    throw new BadRequestError('Pemilik workspace (owner) tidak dapat dihapus.');
  }

  await WorkspaceRepository.removeMember(targetUserId, workspaceId);
  return { success: true };
};

export const assignRole = async (workspaceId, targetUserId, role) => {
  if (!['admin', 'member'].includes(role)) {
    throw new BadRequestError('Role tidak valid. Pilih antara admin atau member.');
  }

  const membership = await WorkspaceRepository.findMember(targetUserId, workspaceId);
  if (!membership) {
    throw new NotFoundError('Anggota tidak ditemukan di workspace ini.');
  }

  if (membership.role === 'owner') {
    throw new BadRequestError('Role pemilik workspace (owner) tidak dapat diubah.');
  }

  membership.role = role;
  await membership.save();

  return membership;
};

export const assignPermissions = async (workspaceId, targetUserId, grant = [], deny = []) => {
  const membership = await WorkspaceRepository.findMember(targetUserId, workspaceId);
  if (!membership) {
    throw new NotFoundError('Anggota tidak ditemukan di workspace ini.');
  }

  membership.permissionOverrides = {
    grant,
    deny,
  };
  await membership.save();

  return membership;
};
