import express from "express";
import {
  createAIBehaviorLog,
  deleteAIBehaviorLog,
  getAIBehaviorLogById,
  getAllAIBehaviorLogs,
  getMyAIBehaviorLogs,
} from "../controllers/aiBehaviorLogControllers.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", createAIBehaviorLog);
router.get("/me", getMyAIBehaviorLogs);
router.get("/", requireAdmin, getAllAIBehaviorLogs);
router.get("/:id", requireAdmin, getAIBehaviorLogById);
router.delete("/:id", requireAdmin, deleteAIBehaviorLog);

export default router;
