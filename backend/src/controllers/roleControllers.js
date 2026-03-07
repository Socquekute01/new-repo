import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import User from '../models/User.js';

export const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find().populate('permissions').sort({ createdAt: -1 });
        res.status(200).json(roles);
    } catch (error) {
        console.error("Error in getAllRoles:", error);
        res.status(500).json({ message: "Server error while fetching roles" });
    }
};

export const getRoleById = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id).populate('permissions');
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }
        res.status(200).json(role);
    } catch (error) {
        console.error("Error in getRoleById:", error);
        res.status(500).json({ message: "Server error while fetching role" });
    }
};

export const createRole = async (req, res) => {
    try {
        const { name, description, permissionIds } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Role name is required" });
        }

        const normalizedName = name.trim().toLowerCase();
        let permissions = [];

        if (normalizedName === "admin") {
            const allPermissions = await Permission.find();
            permissions = allPermissions.map((permission) => permission._id);
        } else if (Array.isArray(permissionIds) && permissionIds.length > 0) {
            const foundPermissions = await Permission.find({ _id: { $in: permissionIds } });
            permissions = foundPermissions.map((permission) => permission._id);
        }

        const role = new Role({
            name: normalizedName,
            description,
            permissions,
        });
        const newRole = await role.save();
        const populatedRole = await Role.findById(newRole._id).populate('permissions');
        res.status(201).json(populatedRole);
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: "Role name already exists" });
        }
        if (error?.name === "ValidationError") {
            const messages = Object.values(error.errors || {}).map((err) => err.message);
            return res.status(400).json({ message: messages.join(", ") });
        }
        console.error("Error in createRole:", error);
        res.status(500).json({ message: "Server error while creating role" });
    }
};

export const updateRole = async (req, res) => {
    try {
        const { name, description, permissionIds } = req.body;
        const updates = {};
        if (name) {
            updates.name = name.trim().toLowerCase();
        }
        if (description !== undefined) {
            updates.description = description;
        }
        let existingRole = null;
        if (!updates.name) {
            existingRole = await Role.findById(req.params.id);
        }

        const targetRoleName = (updates.name || existingRole?.name || '').toLowerCase();

        if (targetRoleName === "admin") {
            const allPermissions = await Permission.find();
            updates.permissions = allPermissions.map((permission) => permission._id);
        } else if (Array.isArray(permissionIds)) {
            const foundPermissions = await Permission.find({ _id: { $in: permissionIds } });
            updates.permissions = foundPermissions.map((permission) => permission._id);
        }

        const updatedRole = await Role.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        ).populate('permissions');

        if (!updatedRole) {
            return res.status(404).json({ message: "Role not found" });
        }
        res.status(200).json(updatedRole);
    } catch (error) {
        console.error("Error in updateRole:", error);
        res.status(500).json({ message: "Server error while updating role" });
    }
};

export const deleteRole = async (req, res) => {
    try {
        const role = await Role.findByIdAndDelete(req.params.id);
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        await User.updateMany(
            { roles: req.params.id },
            { $pull: { roles: req.params.id } }
        );

        res.status(200).json(role);
    } catch (error) {
        console.error("Error in deleteRole:", error);
        res.status(500).json({ message: "Server error while deleting role" });
    }
};

export const addPermissionsToRole = async (req, res) => {
    try {
        const { permissionIds } = req.body;
        if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
            return res.status(400).json({ message: "permissionIds array is required" });
        }

        const foundPermissions = await Permission.find({ _id: { $in: permissionIds } });
        const permissionObjectIds = foundPermissions.map((permission) => permission._id);

        const updatedRole = await Role.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { permissions: { $each: permissionObjectIds } } },
            { new: true }
        ).populate('permissions');

        if (!updatedRole) {
            return res.status(404).json({ message: "Role not found" });
        }

        res.status(200).json(updatedRole);
    } catch (error) {
        console.error("Error in addPermissionsToRole:", error);
        res.status(500).json({ message: "Server error while adding permissions" });
    }
};

export const removePermissionFromRole = async (req, res) => {
    try {
        const updatedRole = await Role.findByIdAndUpdate(
            req.params.id,
            { $pull: { permissions: req.params.permissionId } },
            { new: true }
        ).populate('permissions');

        if (!updatedRole) {
            return res.status(404).json({ message: "Role not found" });
        }

        res.status(200).json(updatedRole);
    } catch (error) {
        console.error("Error in removePermissionFromRole:", error);
        res.status(500).json({ message: "Server error while removing permission" });
    }
};

