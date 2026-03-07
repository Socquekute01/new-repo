import Permission from '../models/Permission.js';
import Role from '../models/Role.js';

export const getAllPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find().sort({ createdAt: -1 });
        res.status(200).json(permissions);
    } catch (error) {
        console.error("Error in getAllPermissions:", error);
        res.status(500).json({ message: "Server error while fetching permissions" });
    }
};

export const getPermissionById = async (req, res) => {
    try {
        const permission = await Permission.findById(req.params.id);
        if (!permission) {
            return res.status(404).json({ message: "Permission not found" });
        }
        res.status(200).json(permission);
    } catch (error) {
        console.error("Error in getPermissionById:", error);
        res.status(500).json({ message: "Server error while fetching permission" });
    }
};

export const createPermission = async (req, res) => {
    try {
        const { key, description } = req.body;
        if (!key) {
            return res.status(400).json({ message: "Permission key is required" });
        }
        const normalizedKey = key.trim().toLowerCase();
        const permission = new Permission({ key: normalizedKey, description });
        const newPermission = await permission.save();

        // Ensure admin role always has all permissions
        const adminRole = await Role.findOneAndUpdate(
            { name: "admin" },
            { $addToSet: { permissions: newPermission._id } },
            { new: true, upsert: true }
        );
        if (adminRole && !adminRole.permissions?.includes(newPermission._id)) {
            adminRole.permissions.push(newPermission._id);
            await adminRole.save();
        }

        res.status(201).json(newPermission);
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: "Permission key already exists" });
        }
        if (error?.name === "ValidationError") {
            const messages = Object.values(error.errors || {}).map((err) => err.message);
            return res.status(400).json({ message: messages.join(", ") });
        }
        console.error("Error in createPermission:", error);
        res.status(500).json({ message: "Server error while creating permission" });
    }
};

export const updatePermission = async (req, res) => {
    try {
        const { key, description } = req.body;
        const updates = {};
        if (key) {
            updates.key = key.trim().toLowerCase();
        }
        if (description !== undefined) {
            updates.description = description;
        }

        const updatedPermission = await Permission.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );
        if (!updatedPermission) {
            return res.status(404).json({ message: "Permission not found" });
        }
        res.status(200).json(updatedPermission);
    } catch (error) {
        console.error("Error in updatePermission:", error);
        res.status(500).json({ message: "Server error while updating permission" });
    }
};

export const deletePermission = async (req, res) => {
    try {
        const permission = await Permission.findByIdAndDelete(req.params.id);
        if (!permission) {
            return res.status(404).json({ message: "Permission not found" });
        }

        await Role.updateMany(
            { permissions: req.params.id },
            { $pull: { permissions: req.params.id } }
        );

        res.status(200).json(permission);
    } catch (error) {
        console.error("Error in deletePermission:", error);
        res.status(500).json({ message: "Server error while deleting permission" });
    }
};

