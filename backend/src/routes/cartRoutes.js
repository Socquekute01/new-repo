import express from "express";
import {
  getAllCarts,
  getCartById,
  createCart,
  updateCart,
  deleteCart,
  getMyCart,
} from "../controllers/cartControllers.js";

const router = express.Router();

router.get("/my", getMyCart);
router.get("/", getAllCarts);
router.get("/:id", getCartById);
router.post("/", createCart);
router.put("/:id", updateCart);
router.delete("/:id", deleteCart);

export default router;
