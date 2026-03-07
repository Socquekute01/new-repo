import express from 'express';
import { getAllChatbotLogs, getChatbotLogById, createChatbotLog, updateChatbotLog, deleteChatbotLog } from '../controllers/chatbotLogControllers.js';

const router = express.Router();

router.get('/', getAllChatbotLogs);
router.get('/:id', getChatbotLogById);
router.post('/', createChatbotLog);
router.put('/:id', updateChatbotLog);
router.delete('/:id', deleteChatbotLog);

export default router;
