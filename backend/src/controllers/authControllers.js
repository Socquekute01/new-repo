import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../config/email.js";

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "your-secret-key-change-in-production",
    {
      expiresIn: "7d",
    },
  );
};

// Register
export const register = async (req, res) => {
  try {
    const { username, name, email, password, phone } = req.body;

    if ((!username && !name) || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username or name, email and password",
      });
    }

    const finalUsername = username || name;
    const finalName = name || username;

    const existingUserByUsername = await User.findOne({
      username: finalUsername,
    });
    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        message: "Username is already taken",
      });
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use",
      });
    }

    const user = new User({
      username: finalUsername,
      name: finalName,
      email,
      password,
      phone: phone || "",
    });

    await user.save();

    sendWelcomeEmail({
      name: user.name,
      email: user.email,
      username: user.username,
    }).catch((err) => console.error("[Email] Lỗi gửi welcome:", err?.message || err));

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Register success",
      data: {
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          roles: user.roles,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already in use`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error when registering",
      error: error.message,
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login success",
      data: {
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          roles: user.roles,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when logging in",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: "roles",
      populate: { path: "permissions" },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
          roles: user.roles,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when fetching user",
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { username, name, email, phone, address } = req.body;

    if (!username && !name && !email && !phone && !address) {
      return res.status(400).json({
        success: false,
        message: "Please provide fields to update",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (username && username !== user.username) {
      const exists = await User.findOne({ username, _id: { $ne: user._id } });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken",
        });
      }
      user.username = username;
    }

    if (name) {
      user.name = name;
    }

    if (email && email !== user.email) {
      const exists = await User.findOne({ email, _id: { $ne: user._id } });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use",
        });
      }
      user.email = email;
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    if (address !== undefined) {
      user.address = address;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated",
      data: {
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
          roles: user.roles,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already in use`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error when updating profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.userId).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error when changing password",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
