import {
  VNPay,
  ProductCode,
  VnpLocale,
  IpnFailChecksum,
  IpnOrderNotFound,
  IpnInvalidAmount,
  InpOrderAlreadyConfirmed,
  IpnUnknownError,
  IpnSuccess,
  ignoreLogger,
} from "vnpay";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import OrderItem from "../models/OrderItem.js";
import { sendOrderConfirmationEmail } from "../config/email.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMN_CODE,
  secureSecret: process.env.VNPAY_SECURE_SECRET,
  vnpayHost: process.env.VNPAY_HOST || "https://sandbox.vnpayment.vn",
  testMode: process.env.VNPAY_TEST_MODE === "true",
  hashAlgorithm: process.env.VNPAY_HASH_ALGORITHM || "SHA512",
  enableLog: process.env.VNPAY_ENABLE_LOG === "true",
  loggerFn: ignoreLogger,
});

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0];
  }
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return (
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    "127.0.0.1"
  );
};

const ensureVnpayConfig = () => {
  if (!process.env.VNPAY_TMN_CODE || !process.env.VNPAY_SECURE_SECRET) {
    return "Missing VNPAY_TMN_CODE or VNPAY_SECURE_SECRET";
  }
  if (!process.env.VNPAY_RETURN_URL) {
    return "Missing VNPAY_RETURN_URL";
  }
  return null;
};

export const createVnpayPaymentUrl = async (req, res) => {
  try {
    const configError = ensureVnpayConfig();
    if (configError) {
      return res.status(500).json({ message: configError });
    }

    const { orderId, returnUrl, locale, bankCode } = req.body || {};
    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user?.toString() !== req.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (order.status === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    const amount = Math.round(Number(order.totalAmount));
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: getClientIp(req),
      vnp_TxnRef: order._id.toString(),
      vnp_OrderInfo: `Thanh toan don hang ${order._id}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: returnUrl || process.env.VNPAY_RETURN_URL,
      vnp_Locale: locale === "en" ? VnpLocale.EN : VnpLocale.VN,
      ...(bankCode ? { vnp_BankCode: bankCode } : {}),
    });

    const existingPayment = await Payment.findOne({ order: order._id });
    if (existingPayment) {
      existingPayment.paymentMethod = "vnpay";
      existingPayment.paymentStatus = "pending";
      await existingPayment.save();
    } else {
      await Payment.create({
        order: order._id,
        paymentMethod: "vnpay",
        paymentStatus: "pending",
      });
    }

    return res.status(200).json({ paymentUrl, orderId: order._id });
  } catch (error) {
    console.error("Error in createVnpayPaymentUrl:", error);
    return res.status(500).json({
      message: "Server error while creating VNPay URL",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const handleVnpayReturn = async (req, res) => {
  try {
    const verify = vnpay.verifyReturnUrl(req.query);

    if (verify.isVerified && verify.isSuccess && verify.vnp_TxnRef) {
      try {
        const order = await Order.findById(verify.vnp_TxnRef);

        if (order && order.status !== "completed" && order.status !== "paid") {
          order.status = "paid";
          await order.save();

          await Payment.findOneAndUpdate(
            { order: order._id },
            {
              paymentMethod: "vnpay",
              paymentStatus: "completed",
              transactionCode: verify.vnp_TransactionNo,
              paidAt: new Date(),
            },
            { upsert: true },
          );

          // Trừ stock sản phẩm
          const orderItems = await OrderItem.find({ order: order._id });
          for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: -item.quantity },
            });
          }

          // Xóa giỏ hàng của user
          const cart = await Cart.findOne({ user: order.user });
          if (cart) {
            await CartItem.deleteMany({ cart: cart._id });
          }
          sendOrderConfirmationEmail(order._id.toString()).catch((e) =>
            console.error("[VNPay Return] Lỗi gửi email:", e.message),
          );
        }
      } catch (dbError) {
        console.error("Error updating order in handleVnpayReturn:", dbError);
      }
    }

    return res.status(200).json({
      isVerified: verify.isVerified,
      isSuccess: verify.isSuccess,
      orderId: verify.vnp_TxnRef,
      message: verify.message,
    });
  } catch (error) {
    console.error("Error in handleVnpayReturn:", error);
    return res.status(400).json({ message: "Invalid VNPay return data" });
  }
};

export const handleVnpayIpn = async (req, res) => {
  if (!req.query || Object.keys(req.query).length === 0) {
    return res.status(200).json({ message: "IPN OK" });
  }

  try {
    const verify = vnpay.verifyIpnCall(req.query);

    if (!verify.isVerified) {
      return res.json(IpnFailChecksum);
    }
    if (!verify.isSuccess) {
      return res.json(IpnUnknownError);
    }

    const order = await Order.findById(verify.vnp_TxnRef);
    if (!order) {
      return res.json(IpnOrderNotFound);
    }

    const amount = Math.round(Number(order.totalAmount));
    if (Number(verify.vnp_Amount) !== amount) {
      return res.json(IpnInvalidAmount);
    }

    if (order.status === "paid" || order.status === "completed") {
      return res.json(InpOrderAlreadyConfirmed);
    }

    order.status = "paid";
    await order.save();

    await Payment.findOneAndUpdate(
      { order: order._id },
      {
        paymentMethod: "vnpay",
        paymentStatus: "completed",
        transactionCode: verify.vnp_TransactionNo,
        paidAt: new Date(),
      },
      { upsert: true },
    );

    const orderItems = await OrderItem.find({ order: order._id });
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    const cart = await Cart.findOne({ user: order.user });
    if (cart) {
      await CartItem.deleteMany({ cart: cart._id });
    }
    sendOrderConfirmationEmail(order._id.toString()).catch((e) =>
      console.error("[VNPay IPN] Lỗi gửi email:", e.message),
    );

    return res.json(IpnSuccess);
  } catch (err) {
    console.error("IPN error:", err);
    return res.json(IpnUnknownError);
  }
};
