import ChatbotLog from '../models/ChatbotLog.js';

export const getAllChatbotLogs = async (req, res) => {
    try {
        const logs = await ChatbotLog.find().sort({ createdAt: -1 });
        res.status(200).json(logs);
    } catch (error) {
        console.error("Error in getAllChatbotLogs:", error);
        res.status(500).json({ message: "Server error while fetching chatbot logs" });
    }
};

export const getChatbotLogById = async (req, res) => {
    try {
        const log = await ChatbotLog.findById(req.params.id);
        if (!log) {
            return res.status(404).json({ message: "Chatbot log not found" });
        }
        res.status(200).json(log);
    } catch (error) {
        console.error("Error in getChatbotLogById:", error);
        res.status(500).json({ message: "Server error while fetching chatbot log" });
    }
};

export const createChatbotLog = async (req, res) => {
    try {
        const { user, message, response } = req.body;
        const log = new ChatbotLog({ user, message, response });
        const newLog = await log.save();
        res.status(201).json(newLog);
    } catch (error) {
        console.error("Error in createChatbotLog:", error);
        res.status(500).json({ message: "Server error while creating chatbot log" });
    }
};

export const updateChatbotLog = async (req, res) => {
    try {
        const { user, message, response } = req.body;
        const updatedLog = await ChatbotLog.findByIdAndUpdate(
            req.params.id,
            { user, message, response },
            { new: true }
        );
        if (!updatedLog) {
            return res.status(404).json({ message: "Chatbot log not found" });
        }
        res.status(200).json(updatedLog);
    } catch (error) {
        console.error("Error in updateChatbotLog:", error);
        res.status(500).json({ message: "Server error while updating chatbot log" });
    }
};

export const deleteChatbotLog = async (req, res) => {
    try {
        const deletedLog = await ChatbotLog.findByIdAndDelete(req.params.id);
        if (!deletedLog) {
            return res.status(404).json({ message: "Chatbot log not found" });
        }
        res.status(200).json(deletedLog);
    } catch (error) {
        console.error("Error in deleteChatbotLog:", error);
        res.status(500).json({ message: "Server error while deleting chatbot log" });
    }
};
