import express from 'express';
import { getAllCartItems, getCartItemById, createCartItem, updateCartItem, deleteCartItem } from '../controllers/cartItemControllers.js';

const router = express.Router();

router.get('/', getAllCartItems);
router.get('/:id', getCartItemById);
router.post('/', createCartItem);
router.put('/:id', updateCartItem);
router.delete('/:id', deleteCartItem);

export default router;
