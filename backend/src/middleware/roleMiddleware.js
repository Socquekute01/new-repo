import User from "../models/User.js";
import Role from "../models/Role.js";

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in requireAdmin:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking admin role",
    });
  }
};

export const requireManager = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Manager access required",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in requireManager:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking manager role",
    });
  }
};

export const requireStaff = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "staff") {
      return res.status(403).json({
        success: false,
        message: "Staff access required",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in requireStaff:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking staff role",
    });
  }
};

export const requireManagerOrAdmin = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "admin" && user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Manager or admin access required",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in requireManagerOrAdmin:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking manager/admin role",
    });
  }
};

export const requirePermission = (permissionKey) => async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      req.user = user;
      return next();
    }

    if (!user.role) {
      return res.status(403).json({
        success: false,
        message: "Role not assigned",
      });
    }

    const roleByName = await Role.findOne({ name: user.role }).populate(
      "permissions",
    );
    const hasPermission = (roleByName?.permissions || []).some(
      (permission) => permission?.key === permissionKey,
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in requirePermission:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking permission",
    });
  }
};
