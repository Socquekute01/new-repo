import express from 'express';
import {
  getAllRecommendations,
  getRecommendationById,
  createRecommendation,
  updateRecommendation,
  deleteRecommendation,
  generateRecommendations,
} from '../controllers/aiRecommendationControllers.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', requireAdmin, getAllRecommendations);
router.get('/:id', requireAdmin, getRecommendationById);
router.post('/', requireAdmin, createRecommendation);
router.post('/generate', generateRecommendations);
router.put('/:id', requireAdmin, updateRecommendation);
router.delete('/:id', requireAdmin, deleteRecommendation);

export default router;
