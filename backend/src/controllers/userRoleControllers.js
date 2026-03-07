import User from '../models/User.js';
import Role from '../models/Role.js';

export const getUserRoles = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('roles');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ roles: user.roles || [] });
    } catch (error) {
        console.error("Error in getUserRoles:", error);
        res.status(500).json({ message: "Server error while fetching user roles" });
    }
};

export const assignRolesToUser = async (req, res) => {
    try {
        const { roleIds, replace } = req.body;
        if (!Array.isArray(roleIds) || roleIds.length === 0) {
            return res.status(400).json({ message: "roleIds array is required" });
        }

        const roles = await Role.find({ _id: { $in: roleIds } });
        const roleObjectIds = roles.map((role) => role._id);

        const update = replace
            ? { roles: roleObjectIds }
            : { $addToSet: { roles: { $each: roleObjectIds } } };

        const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).populate('roles');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ roles: user.roles || [] });
    } catch (error) {
        console.error("Error in assignRolesToUser:", error);
        res.status(500).json({ message: "Server error while assigning roles" });
    }
};

export const removeRoleFromUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $pull: { roles: req.params.roleId } },
            { new: true }
        ).populate('roles');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ roles: user.roles || [] });
    } catch (error) {
        console.error("Error in removeRoleFromUser:", error);
        res.status(500).json({ message: "Server error while removing role" });
    }
};