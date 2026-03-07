import express from "express";
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
} from "../controllers/authControllers.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { checkDBConnection } from "../middleware/dbCheckMiddleware.js";

const router = express.Router();

// Route Ä‘Äƒng kÃ½
router.post("/register", checkDBConnection, register);

// Route Ä‘Äƒng nháº­p
router.post("/login", checkDBConnection, login);

// Route láº¥y thÃ´ng tin user hiá»‡n táº¡i (cáº§n xÃ¡c thá»±c)
router.get("/me", authenticateToken, getCurrentUser);

// Route cáº­p nháº­t thÃ´ng tin user (cáº§n xÃ¡c thá»±c)
router.put("/me", authenticateToken, updateProfile);

// Route đổi mật khẩu (cần xác thực)
router.put("/change-password", authenticateToken, changePassword);

export default router;
