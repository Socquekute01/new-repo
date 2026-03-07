import AIBehaviorLog from "../models/AIBehaviorLog.js";

export const logAIBehavior = async (payload) => {
  if (!payload || !payload.user || !payload.action) return;
  try {
    await AIBehaviorLog.create(payload);
  } catch (error) {
    console.warn(
      "[AIBehaviorLog] Failed to save behavior log:",
      error?.message || error,
    );
  }
};
