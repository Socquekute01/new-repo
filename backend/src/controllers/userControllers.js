import User from "../models/User.js";

const normalizeAddress = (address) => {
  if (!address) return undefined;
  if (typeof address === "string") {
    return { street: address };
  }
  return address;
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").populate("roles");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ message: "Server error while fetching users" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("roles");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({ message: "Server error while fetching user" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { username, name, email, phone, address, password, role } = req.body;
    const user = await User.findById(req.params.id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username && username !== user.username) {
      const exists = await User.findOne({
        username,
        _id: { $ne: user._id },
      });
      if (exists) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const exists = await User.findOne({ email, _id: { $ne: user._id } });
      if (exists) {
        return res.status(400).json({ message: "Email is already in use" });
      }
      user.email = email;
    }

    if (name !== undefined) {
      user.name = name;
    }
    if (phone !== undefined) {
      user.phone = phone;
    }
    if (address !== undefined) {
      user.address = normalizeAddress(address);
    }
    if (role) {
      user.role = role;
    }
    if (password) {
      user.password = password;
    }

    await user.save();
    const updated = await User.findById(user._id)
      .select("-password")
      .populate("roles");
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error in updateUser:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Server error while updating user" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(deleted);
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ message: "Server error while deleting user" });
  }
};
