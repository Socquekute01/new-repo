import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const getManagerStats = async (req, res) => {
  try {
    // Total Revenue from completed orders
    const completedOrders = await Order.find({ status: "completed" });
    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    // Count new orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newOrdersCount = await Order.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Total orders count
    const totalOrders = await Order.countDocuments();

    // Total products count
    const totalProducts = await Product.countDocuments();

    // Pending orders count
    const pendingOrders = await Order.countDocuments({ status: "pending" });

    // Recent orders (last 10)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "username email");

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Top selling products (last 30 days)
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $in: ["completed", "shipped", "paid"] },
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      {
        $sort: { totalQuantity: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $unwind: "$productInfo",
      },
      {
        $project: {
          _id: 1,
          name: "$productInfo.name",
          totalQuantity: 1,
          totalRevenue: 1,
          image: "$productInfo.images",
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        newOrdersCount,
        totalOrders,
        totalProducts,
        pendingOrders,
        recentOrders,
        monthlyRevenue,
        ordersByStatus,
        topProducts,
      },
    });
  } catch (error) {
    console.error("Error in getManagerStats:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching manager stats",
    });
  }
};

export const getManagerOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate("user", "username email");

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error in getManagerOrders:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

export const getManagerProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate("category", "name");

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error in getManagerProducts:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, images, size } =
      req.body;

    // Validation
    if (!name || !price || !category || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      images: images || [],
      size: size || [],
    });

    await product.populate("category", "name");

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error in createProduct:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while creating product",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock, images, size } =
      req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updateData = {
      name: name || product.name,
      description: description || product.description,
      price: price !== undefined ? price : product.price,
      category: category || product.category,
      stock: stock !== undefined ? stock : product.stock,
      images: images || product.images,
      size: size || product.size,
    };

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("category", "name");

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error in updateProduct:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while updating product",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while deleting product",
    });
  }
};

// Manager Report Functions
export const getManagerSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    const totalSales = await Order.aggregate([
      { $match: { ...dateFilter, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const ordersCount = await Order.countDocuments(dateFilter);

    const avgOrderValue =
      totalSales.length > 0 && ordersCount > 0
        ? totalSales[0].total / ordersCount
        : 0;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalSales[0]?.total || 0,
        totalOrders: ordersCount,
        averageOrderValue: avgOrderValue,
      },
    });
  } catch (error) {
    console.error("Error in getManagerSalesReport:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching sales report",
    });
  }
};

export const getManagerTopProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topProducts = await Order.aggregate([
      {
        $match: {
          status: { $in: ["completed", "shipped", "paid"] },
        },
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "_id",
          foreignField: "order",
          as: "items",
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      {
        $sort: { totalQuantity: -1 },
      },
      {
        $limit: parseInt(limit),
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $unwind: "$productInfo",
      },
    ]);

    res.status(200).json({
      success: true,
      data: topProducts,
    });
  } catch (error) {
    console.error("Error in getManagerTopProducts:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching top products",
    });
  }
};

export const getManagerRevenueByCategory = async (req, res) => {
  try {
    const revenueByCategory = await Order.aggregate([
      {
        $match: { status: "completed" },
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "_id",
          foreignField: "order",
          as: "items",
        },
      },
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $group: {
          _id: "$category._id",
          categoryName: { $first: "$category.name" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: revenueByCategory,
    });
  } catch (error) {
    console.error("Error in getManagerRevenueByCategory:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching revenue by category",
    });
  }
};

export const getManagerCustomerStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: "user" });
    const activeCustomers = await Order.distinct("user");

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers: activeCustomers.length,
      },
    });
  } catch (error) {
    console.error("Error in getManagerCustomerStats:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching customer stats",
    });
  }
};

export const getManagerInventoryReport = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({
      stock: { $gt: 0, $lt: 10 },
    });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });

    const lowStockList = await Product.find({
      $or: [{ stock: 0 }, { stock: { $lt: 10 } }],
    })
      .select("name stock")
      .sort({ stock: 1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        lowStockList,
      },
    });
  } catch (error) {
    console.error("Error in getManagerInventoryReport:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching inventory report",
    });
  }
};
