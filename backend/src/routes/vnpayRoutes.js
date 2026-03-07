import express from "express";
import {
  createVnpayPaymentUrl,
  handleVnpayReturn,
  handleVnpayIpn,
} from "../controllers/vnpayControllers.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authenticateToken, createVnpayPaymentUrl);
router.get("/return", handleVnpayReturn);
router.get("/ipn", handleVnpayIpn);

export default router;
