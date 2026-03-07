import CartItem from "../models/CartItem.js";

export const getAllCartItems = async (req, res) => {
  try {
    const { cart } = req.query;
    const query = cart ? { cart } : {};
    const items = await CartItem.find(query)
      .populate("product")
      .sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error("Error in getAllCartItems:", error);
    res.status(500).json({ message: "Server error while fetching cart items" });
  }
};

export const getCartItemById = async (req, res) => {
  try {
    const item = await CartItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    console.error("Error in getCartItemById:", error);
    res.status(500).json({ message: "Server error while fetching cart item" });
  }
};

export const createCartItem = async (req, res) => {
  try {
    const { cart, product, quantity, price, size } = req.body;
    if (!cart || !product || !quantity || price === undefined) {
      return res
        .status(400)
        .json({ message: "cart, product, quantity and price are required" });
    }

    const existing = await CartItem.findOne({ cart, product, size });
    if (existing) {
      existing.quantity += quantity;
      existing.price = price;
      const updated = await existing.save();
      return res.status(200).json(updated);
    }

    const item = new CartItem({ cart, product, quantity, price, size });
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error in createCartItem:", error);
    res.status(500).json({ message: "Server error while creating cart item" });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { cart, product, quantity, price, size } = req.body;
    const updatedItem = await CartItem.findByIdAndUpdate(
      req.params.id,
      { cart, product, quantity, price, size },
      { new: true },
    );
    if (!updatedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error in updateCartItem:", error);
    res.status(500).json({ message: "Server error while updating cart item" });
  }
};

export const deleteCartItem = async (req, res) => {
  try {
    const deletedItem = await CartItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    res.status(200).json(deletedItem);
  } catch (error) {
    console.error("Error in deleteCartItem:", error);
    res.status(500).json({ message: "Server error while deleting cart item" });
  }
};
