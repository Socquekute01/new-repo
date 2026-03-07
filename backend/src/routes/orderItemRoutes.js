import express from 'express';
import { getAllOrderItems, getOrderItemById, createOrderItem, updateOrderItem, deleteOrderItem } from '../controllers/orderItemControllers.js';

const router = express.Router();

router.get('/', getAllOrderItems);
router.get('/:id', getOrderItemById);
router.post('/', createOrderItem);
router.put('/:id', updateOrderItem);
router.delete('/:id', deleteOrderItem);

export default router;
