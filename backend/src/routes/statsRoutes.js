import express from "express";
import { getDashboardStats } from "../controllers/statsControllers.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", authenticateToken, getDashboardStats);

export default router;
