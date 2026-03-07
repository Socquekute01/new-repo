import express from "express";
import {
  chatWithGemini,
  getMyChatHistory,
} from "../controllers/chatbotControllers.js";

const router = express.Router();

router.post("/chat", chatWithGemini);
router.get("/history", getMyChatHistory);

export default router;
