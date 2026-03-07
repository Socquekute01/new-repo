import Category from '../models/Category.js';

export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error in getAllCategories:", error);
        res.status(500).json({ message: "Server error while fetching categories" });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(category);
    } catch (error) {
        console.error("Error in getCategoryById:", error);
        res.status(500).json({ message: "Server error while fetching category" });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = new Category({ name, description });
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (error) {
        console.error("Error in createCategory:", error);
        res.status(500).json({ message: "Server error while creating category" });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true }
        );
        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error("Error in updateCategory:", error);
        res.status(500).json({ message: "Server error while updating category" });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(deletedCategory);
    } catch (error) {
        console.error("Error in deleteCategory:", error);
        res.status(500).json({ message: "Server error while deleting category" });
    }
};
