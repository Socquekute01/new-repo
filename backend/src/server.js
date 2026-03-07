import express from "express";
import cors from "cors";
import productsRoutes from "./routes/productsRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import aiRecommendationRoutes from "./routes/aiRecommendationRoutes.js";
import chatbotLogRoutes from "./routes/chatbotLogRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import aiBehaviorLogRoutes from "./routes/aiBehaviorLogRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import cartItemRoutes from "./routes/cartItemRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import orderItemRoutes from "./routes/orderItemRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import vnpayRoutes from "./routes/vnpayRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import permissionsRoutes from "./routes/permissionsRoutes.js";
import userRoleRoutes from "./routes/userRoleRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import { authenticateToken } from "./middleware/authMiddleware.js";
import {
  requireAdmin,
  requirePermission,
} from "./middleware/roleMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PORT = process.env.PORT || 5001;

const app = express();

const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:5173,http://localhost:5174,http://localhost:3000,http://localhost:5001,http://127.0.0.1:5001"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

// CORS: allow configured origins for all routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Middleware Ä‘á»ƒ parse JSON tá»« request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Request logging (debug)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`,
    );
  });
  next();
});

// Routes
app.use("/api/users", authRoutes);
// Back-compat: allow /api/register and /api/login (and /api/me) to hit user routes
app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/roles", authenticateToken, requireAdmin, rolesRoutes);
app.use("/api/permissions", authenticateToken, requireAdmin, permissionsRoutes);
app.use("/api/users", authenticateToken, requireAdmin, userRoleRoutes);
app.use("/api/users", authenticateToken, requireAdmin, userRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use(
  "/api/recommendations",
  authenticateToken,
  aiRecommendationRoutes,
);
app.use("/api/chatbot-logs", authenticateToken, requireAdmin, chatbotLogRoutes);
app.use("/api/chatbot", authenticateToken, chatbotRoutes);
app.use("/api/ai-behavior-logs", authenticateToken, aiBehaviorLogRoutes);
app.use("/api/carts", authenticateToken, cartRoutes);
app.use("/api/cart-items", authenticateToken, cartItemRoutes);
app.use("/api/orders", authenticateToken, orderRoutes);
app.use(
  "/api/order-items",
  authenticateToken,
  requirePermission("manage_orders"),
  orderItemRoutes,
);
app.use("/api/payments", authenticateToken, requireAdmin, paymentRoutes);
app.use("/api/vnpay", vnpayRoutes);
app.use("/api/stats", authenticateToken, requireAdmin, statsRoutes);
app.use("/api/reports", authenticateToken, requireAdmin, reportRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/staff", staffRoutes);
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware xá»­ lÃ½ lá»—i (pháº£i Ä‘áº·t sau táº¥t cáº£ routes)
app.use((err, req, res, next) => {
  console.error("âŒ Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Lá»—i server khÃ´ng xÃ¡c Ä‘á»‹nh",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route khÃ´ng tá»“n táº¡i",
  });
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
}); // Káº¿t ná»‘i vá»›i MongoDB trÆ°á»›c khi khá»Ÿi Ä‘á»™ng server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`ðŸš€ Server báº¯t Ä‘áº§u trÃªn cá»•ng ${PORT}`);
      console.log(`Swagger UI: http://localhost:${PORT}/swagger`);
    });
  })
  .catch((error) => {
    console.error("âŒ KhÃ´ng thá»ƒ khá»Ÿi Ä‘á»™ng server:", error);
    process.exit(1);
  });
