import OrderItem from '../models/OrderItem.js';

export const getAllOrderItems = async (req, res) => {
    try {
        const items = await OrderItem.find().sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (error) {
        console.error("Error in getAllOrderItems:", error);
        res.status(500).json({ message: "Server error while fetching order items" });
    }
};

export const getOrderItemById = async (req, res) => {
    try {
        const item = await OrderItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Order item not found" });
        }
        res.status(200).json(item);
    } catch (error) {
        console.error("Error in getOrderItemById:", error);
        res.status(500).json({ message: "Server error while fetching order item" });
    }
};

export const createOrderItem = async (req, res) => {
    try {
        const { order, product, quantity, price } = req.body;
        const item = new OrderItem({ order, product, quantity, price });
        const newItem = await item.save();
        res.status(201).json(newItem);
    } catch (error) {
        console.error("Error in createOrderItem:", error);
        res.status(500).json({ message: "Server error while creating order item" });
    }
};

export const updateOrderItem = async (req, res) => {
    try {
        const { order, product, quantity, price } = req.body;
        const updatedItem = await OrderItem.findByIdAndUpdate(
            req.params.id,
            { order, product, quantity, price },
            { new: true }
        );
        if (!updatedItem) {
            return res.status(404).json({ message: "Order item not found" });
        }
        res.status(200).json(updatedItem);
    } catch (error) {
        console.error("Error in updateOrderItem:", error);
        res.status(500).json({ message: "Server error while updating order item" });
    }
};

export const deleteOrderItem = async (req, res) => {
    try {
        const deletedItem = await OrderItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ message: "Order item not found" });
        }
        res.status(200).json(deletedItem);
    } catch (error) {
        console.error("Error in deleteOrderItem:", error);
        res.status(500).json({ message: "Server error while deleting order item" });
    }
};
