import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";

export const getMyCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId });
      await cart.save();
    }

    const items = await CartItem.find({ cart: cart._id }).populate("product");

    res.status(200).json({
      success: true,
      cart,
      items,
    });
  } catch (error) {
    console.error("Error in getMyCart:", error);
    res.status(500).json({ message: "Server error while fetching cart" });
  }
};

export const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find().sort({ createdAt: -1 });
    res.status(200).json(carts);
  } catch (error) {
    console.error("Error in getAllCarts:", error);
    res.status(500).json({ message: "Server error while fetching carts" });
  }
};

export const getCartById = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error in getCartById:", error);
    res.status(500).json({ message: "Server error while fetching cart" });
  }
};

export const createCart = async (req, res) => {
  try {
    const { user } = req.body;
    if (!user) {
      return res.status(400).json({ message: "User is required" });
    }

    const existing = await Cart.findOne({ user });
    if (existing) {
      return res.status(200).json(existing);
    }

    const cart = new Cart({ user });
    const newCart = await cart.save();
    res.status(201).json(newCart);
  } catch (error) {
    console.error("Error in createCart:", error);
    res.status(500).json({ message: "Server error while creating cart" });
  }
};

export const updateCart = async (req, res) => {
  try {
    const { user } = req.body;
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      { user },
      { new: true },
    );
    if (!updatedCart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json(updatedCart);
  } catch (error) {
    console.error("Error in updateCart:", error);
    res.status(500).json({ message: "Server error while updating cart" });
  }
};

export const deleteCart = async (req, res) => {
  try {
    const deletedCart = await Cart.findByIdAndDelete(req.params.id);
    if (!deletedCart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json(deletedCart);
  } catch (error) {
    console.error("Error in deleteCart:", error);
    res.status(500).json({ message: "Server error while deleting cart" });
  }
};
