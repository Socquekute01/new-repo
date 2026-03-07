import express from "express";
import { getAdminStats } from "../controllers/adminControllers.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/stats", authenticateToken, requireAdmin, getAdminStats);

export default router;
