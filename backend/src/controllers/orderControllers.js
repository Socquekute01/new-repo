import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";

const computeTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Kiểm tra quyền: chỉ cho phép user xem đơn hàng của chính họ hoặc admin/manager
    const userId = req.userId;
    const userRoles = req.user?.roles || [];
    const isAdmin = userRoles.some(
      (role) => role.name === "admin" || role.name === "manager",
    );

    if (!isAdmin && order.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only view your own orders" });
    }

    const items = await OrderItem.find({ order: order._id }).populate(
      "product",
    );
    res.status(200).json({ order, items });
  } catch (error) {
    console.error("Error in getOrderById:", error);
    res.status(500).json({ message: "Server error while fetching order" });
  }
};

export const createOrder = async (req, res) => {
  try {
    const {
      user,
      items,
      status,
      email,
      shippingAddress,
      paymentMethod,
      shippingFee,
    } = req.body;
    const userId = req.userId || user;
    if (!userId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "user and items are required" });
    }

    const totalAmount = computeTotal(items);
    const order = new Order({
      user: userId,
      totalAmount,
      status,
      email,
      shippingAddress,
      paymentMethod,
      shippingFee,
    });
    const newOrder = await order.save();

    const orderItems = await OrderItem.insertMany(
      items.map((item) => ({
        order: newOrder._id,
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      })),
    );

    // Trừ stock sản phẩm
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Xóa giỏ hàng của user
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      await CartItem.deleteMany({ cart: cart._id });
    }

    res.status(201).json({ order: newOrder, items: orderItems });
  } catch (error) {
    console.error("Error in createOrder:", error);
    res.status(500).json({ message: "Server error while creating order" });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const {
      user,
      status,
      items,
      email,
      shippingAddress,
      paymentMethod,
      shippingFee,
    } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (user) {
      order.user = user;
    }
    if (status) {
      order.status = status;
    }
    if (email !== undefined) {
      order.email = email;
    }
    if (shippingAddress !== undefined) {
      order.shippingAddress = shippingAddress;
    }
    if (paymentMethod) {
      order.paymentMethod = paymentMethod;
    }
    if (shippingFee !== undefined) {
      order.shippingFee = shippingFee;
    }

    let updatedItems = null;
    if (Array.isArray(items) && items.length > 0) {
      await OrderItem.deleteMany({ order: order._id });
      const totalAmount = computeTotal(items);
      order.totalAmount = totalAmount;
      updatedItems = await OrderItem.insertMany(
        items.map((item) => ({
          order: order._id,
          product: item.product,
          quantity: item.quantity,
          price: item.price,
        })),
      );
    }

    const updatedOrder = await order.save();
    res.status(200).json({ order: updatedOrder, items: updatedItems });
  } catch (error) {
    console.error("Error in updateOrder:", error);
    res.status(500).json({ message: "Server error while updating order" });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    await OrderItem.deleteMany({ order: deletedOrder._id });
    await Payment.deleteMany({ order: deletedOrder._id });
    res.status(200).json(deletedOrder);
  } catch (error) {
    console.error("Error in deleteOrder:", error);
    res.status(500).json({ message: "Server error while deleting order" });
  }
};

// Get orders for current user
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "username email");

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error in getMyOrders:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

// Cancel order by user
export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.userId;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Kiểm tra quyền sở hữu
    if (order.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own orders",
      });
    }

    // Không cho phép hủy đơn đã bị hủy, đã giao hàng hoặc đã hoàn tất
    if (
      order.status === "cancelled" ||
      order.status === "shipped" ||
      order.status === "completed"
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`,
      });
    }

    // Kiểm tra thời gian: Chỉ cho phép hủy trong 24 giờ
    const orderCreatedAt = new Date(order.createdAt);
    const now = new Date();
    const hoursSinceCreated = (now - orderCreatedAt) / (1000 * 60 * 60);

    if (hoursSinceCreated > 24) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel order after 24 hours from order creation",
      });
    }

    // Kiểm tra nếu đơn hàng đã thanh toán, cần hoàn tiền
    const needsRefund = order.status === "paid";

    // Cập nhật status thành cancelled
    order.status = "cancelled";
    await order.save();

    // Cập nhật payment nếu cần hoàn tiền
    if (needsRefund) {
      await Payment.findOneAndUpdate(
        { order: order._id },
        {
          paymentStatus: "refund_pending",
        },
      );
    }

    // Hoàn lại stock sản phẩm
    const orderItems = await OrderItem.find({ order: order._id });
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    res.status(200).json({
      success: true,
      message: needsRefund
        ? "Order cancelled successfully. Refund will be processed within 3-5 business days."
        : "Order cancelled successfully",
      data: order,
      needsRefund,
    });
  } catch (error) {
    console.error("Error in cancelOrder:", error);
    res.status(500).json({
      success: false,
      message: "Server error while cancelling order",
    });
  }
};
