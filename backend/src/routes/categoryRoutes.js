import express from 'express';
import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/categoryControllers.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireManagerOrAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', authenticateToken, requireManagerOrAdmin, createCategory);
router.put('/:id', authenticateToken, requireManagerOrAdmin, updateCategory);
router.delete('/:id', authenticateToken, requireManagerOrAdmin, deleteCategory);

export default router;

