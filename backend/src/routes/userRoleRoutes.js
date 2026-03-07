import express from 'express';
import {
    getUserRoles,
    assignRolesToUser,
    removeRoleFromUser
} from '../controllers/userRoleControllers.js';

const router = express.Router();

router.get('/:id/roles', getUserRoles);
router.post('/:id/roles', assignRolesToUser);
router.delete('/:id/roles/:roleId', removeRoleFromUser);

export default router;