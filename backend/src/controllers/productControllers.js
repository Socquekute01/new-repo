import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import OrderItem from "../models/OrderItem.js";

// Get product by id
export const getProductById = async (request, response) => {
  try {
    const product = await Product.findById(request.params.id).populate(
      "category",
      "name",
    );
    if (!product) {
      return response
        .status(404)
        .json({ message: "Product not found with this ID" });
    }
    response.status(200).json(product);
  } catch (error) {
    console.error("Error in getProductById:", error);
    response.status(500).json({
      message: "Server error while fetching product",
    });
  }
};

// Get all products
export const getAllProducts = async (request, response) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });
    response.status(200).json(products);
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    response.status(500).json({
      message: "Server error while fetching products",
    });
  }
};

// Create new product
export const createProduct = async (request, response) => {
  try {
    const {
      name,
      title,
      description,
      price,
      stock,
      images,
      size,
      averageRating,
      category,
    } = request.body;

    if (!category || !mongoose.Types.ObjectId.isValid(category)) {
      return response.status(400).json({
        message: "Invalid category ID",
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return response.status(400).json({
        message: "Category not found",
      });
    }

    const product = new Product({
      name,
      title,
      description,
      price,
      stock,
      images,
      size,
      averageRating,
      category,
    });
    const newProduct = await product.save();
    response.status(201).json(newProduct);
  } catch (error) {
    console.error("Error in createProduct:", error);
    response.status(500).json({
      message: "Server error while creating product",
    });
  }
};

// Update product
export const updateProduct = async (request, response) => {
  try {
    const {
      name,
      title,
      description,
      price,
      stock,
      images,
      size,
      averageRating,
      category,
    } = request.body;

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return response.status(400).json({
          message: "Invalid category ID",
        });
      }

      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return response.status(400).json({
          message: "Category not found",
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      request.params.id,
      {
        name,
        title,
        description,
        price,
        stock,
        images,
        size,
        averageRating,
        category,
      },
      { new: true },
    );
    if (!updatedProduct) {
      return response.status(404).json({
        message: "Product not found with this ID",
      });
    }

    response.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error in updateProduct:", error);
    response.status(500).json({
      message: "Server error while updating product",
    });
  }
};

// Delete product
export const deleteProduct = async (request, response) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(request.params.id);
    if (!deletedProduct) {
      return response.status(404).json({
        message: "Product not found with this ID",
      });
    }
    response.status(200).json(deletedProduct);
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    response.status(500).json({
      message: "Server error while deleting product",
    });
  }
};

// Get best selling products
export const getBestSellers = async (request, response) => {
  try {
    const limit = parseInt(request.query.limit) || 20;

    // Step 1: Aggregate OrderItems to get product IDs + total sold
    const soldData = await OrderItem.aggregate([
      {
        $group: {
          _id: "$product",
          totalSold: { $sum: "$quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
    ]);

    // Fallback: no order data yet → return all products by rating
    if (soldData.length === 0) {
      const allProducts = await Product.find()
        .populate("category", "name")
        .sort({ averageRating: -1, createdAt: -1 })
        .limit(limit);
      return response
        .status(200)
        .json(allProducts.map((p) => ({ ...p.toObject(), totalSold: 0 })));
    }

    // Step 2: Fetch full product info for those IDs in order
    const productIds = soldData.map((d) => d._id);
    const totalSoldMap = {};
    soldData.forEach((d) => {
      totalSoldMap[d._id.toString()] = d.totalSold;
    });

    const products = await Product.find({ _id: { $in: productIds } }).populate(
      "category",
      "name",
    );

    // Re-sort by totalSold and attach totalSold field
    const result = productIds
      .map((id) => {
        const product = products.find(
          (p) => p._id.toString() === id.toString(),
        );
        if (!product) return null;
        return {
          ...product.toObject(),
          totalSold: totalSoldMap[id.toString()] || 0,
        };
      })
      .filter(Boolean);

    response.status(200).json(result);
  } catch (error) {
    console.error("Error in getBestSellers:", error);
    response.status(500).json({
      message: "Server error while fetching best sellers",
    });
  }
};
