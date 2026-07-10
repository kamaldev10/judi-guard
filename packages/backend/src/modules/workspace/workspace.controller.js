import * as workspaceService from './workspace.service.js';

/**
 * @openapi
 * /workspace/members:
 *   get:
 *     tags: [Workspace]
 *     summary: Daftar anggota workspace
 *     description: Mengambil daftar semua anggota di workspace aktif
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar anggota workspace
 *       403:
 *         description: Tidak memiliki permission workspace:read
 */
export const getMembersController = async (req, res, next) => {
  try {
    const { workspaceId } = req.auth;
    const members = await workspaceService.getMembers(workspaceId);

    res.status(200).json({
      status: 'success',
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /workspace/members:
 *   post:
 *     tags: [Workspace]
 *     summary: Undang anggota baru
 *     description: Mengundang user ke workspace berdasarkan email
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       201:
 *         description: Anggota berhasil diundang
 *       404:
 *         description: Email tidak ditemukan
 *       409:
 *         description: User sudah terdaftar di workspace
 */
export const inviteMemberController = async (req, res, next) => {
  try {
    const { workspaceId } = req.auth;
    const { email } = req.body;

    const newMember = await workspaceService.inviteMember(workspaceId, email);

    res.status(201).json({
      status: 'success',
      message: 'Anggota berhasil diundang ke workspace.',
      data: newMember,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /workspace/members/{userId}:
 *   delete:
 *     tags: [Workspace]
 *     summary: Hapus anggota workspace
 *     description: Menghapus anggota dari workspace (tidak bisa hapus owner)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID user yang akan dihapus
 *     responses:
 *       200:
 *         description: Anggota berhasil dihapus
 *       400:
 *         description: Tidak bisa hapus owner
 */
export const removeMemberController = async (req, res, next) => {
  try {
    const { workspaceId } = req.auth;
    const { userId: targetUserId } = req.params;

    await workspaceService.removeMember(workspaceId, targetUserId);

    res.status(200).json({
      status: 'success',
      message: 'Anggota berhasil dihapus dari workspace.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /workspace/members/{userId}/role:
 *   patch:
 *     tags: [Workspace]
 *     summary: Ubah role anggota
 *     description: Mengubah role anggota workspace (admin/member)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, member]
 *                 example: admin
 *     responses:
 *       200:
 *         description: Role berhasil diubah
 *       400:
 *         description: Role tidak valid atau tidak bisa ubah owner
 */
export const assignRoleController = async (req, res, next) => {
  try {
    const { workspaceId } = req.auth;
    const { userId: targetUserId } = req.params;
    const { role } = req.body;

    const updatedMember = await workspaceService.assignRole(workspaceId, targetUserId, role);

    res.status(200).json({
      status: 'success',
      message: 'Role anggota berhasil diubah.',
      data: updatedMember,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /workspace/members/{userId}/permissions:
 *   patch:
 *     tags: [Workspace]
 *     summary: Override permission anggota
 *     description: Memberikan override grant/deny permission spesifik kepada anggota
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               grant:
 *                 type: array
 *                 items: { type: string }
 *                 example: [analysis:start]
 *               deny:
 *                 type: array
 *                 items: { type: string }
 *                 example: [config:write]
 *     responses:
 *       200:
 *         description: Permission overrides berhasil diperbarui
 */
export const assignPermissionsController = async (req, res, next) => {
  try {
    const { workspaceId } = req.auth;
    const { userId: targetUserId } = req.params;
    const { grant, deny } = req.body;

    const updatedMember = await workspaceService.assignPermissions(
      workspaceId,
      targetUserId,
      grant,
      deny
    );

    res.status(200).json({
      status: 'success',
      message: 'Permission overrides berhasil diperbarui.',
      data: updatedMember,
    });
  } catch (error) {
    next(error);
  }
};
