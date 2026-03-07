import AIBehaviorLog from "../models/AIBehaviorLog.js";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const normalizeLimit = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT;
  return Math.max(1, Math.min(parsed, MAX_LIMIT));
};

const normalizeProductIds = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 50);
};

const buildFilters = (query) => {
  const filters = {};
  if (query?.flow) {
    filters.flow = String(query.flow).trim();
  }
  if (query?.action) {
    filters.action = String(query.action).trim();
  }
  if (query?.userId) {
    filters.user = String(query.userId).trim();
  }
  return filters;
};

export const createAIBehaviorLog = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const action = String(req.body?.action || "").trim();
    if (!action) {
      return res.status(400).json({ message: "Action is required" });
    }

    const flow = String(req.body?.flow || "chatbot").trim() || "chatbot";
    const message =
      req.body?.message !== undefined
        ? String(req.body.message || "").trim()
        : undefined;
    const productIds = normalizeProductIds(req.body?.productIds);
    const metadata =
      req.body?.metadata && typeof req.body.metadata === "object"
        ? req.body.metadata
        : undefined;

    const log = await AIBehaviorLog.create({
      user: req.userId,
      flow,
      action,
      message,
      productIds,
      metadata,
    });

    res.status(201).json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error("Error in createAIBehaviorLog:", error);
    res
      .status(500)
      .json({ message: "Server error while creating AI behavior log" });
  }
};

export const getMyAIBehaviorLogs = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const limit = normalizeLimit(req.query?.limit);
    const filters = buildFilters(req.query);
    filters.user = req.userId;

    const logs = await AIBehaviorLog.find(filters)
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error("Error in getMyAIBehaviorLogs:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching AI behavior logs" });
  }
};

export const getAllAIBehaviorLogs = async (req, res) => {
  try {
    const limit = normalizeLimit(req.query?.limit);
    const filters = buildFilters(req.query);

    const logs = await AIBehaviorLog.find(filters)
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error("Error in getAllAIBehaviorLogs:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching AI behavior logs" });
  }
};

export const getAIBehaviorLogById = async (req, res) => {
  try {
    const log = await AIBehaviorLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: "AI behavior log not found" });
    }
    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error("Error in getAIBehaviorLogById:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching AI behavior log" });
  }
};

export const deleteAIBehaviorLog = async (req, res) => {
  try {
    const deleted = await AIBehaviorLog.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "AI behavior log not found" });
    }
    res.status(200).json({
      success: true,
      data: deleted,
    });
  } catch (error) {
    console.error("Error in deleteAIBehaviorLog:", error);
    res
      .status(500)
      .json({ message: "Server error while deleting AI behavior log" });
  }
};
