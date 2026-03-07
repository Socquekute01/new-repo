import express from 'express';
import {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    addPermissionsToRole,
    removePermissionFromRole
} from '../controllers/roleControllers.js';

const router = express.Router();

router.get('/', getAllRoles);
router.get('/:id', getRoleById);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

router.post('/:id/permissions', addPermissionsToRole);
router.delete('/:id/permissions/:permissionId', removePermissionFromRole);

export default router;