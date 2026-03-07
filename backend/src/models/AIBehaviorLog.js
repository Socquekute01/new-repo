import mongoose from "mongoose";

const aiBehaviorLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    flow: {
      type: String,
      trim: true,
      enum: ["chatbot", "recommendation", "other"],
      default: "chatbot",
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    productIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

aiBehaviorLogSchema.index({ user: 1, createdAt: -1 });
aiBehaviorLogSchema.index({ flow: 1, action: 1, createdAt: -1 });

export default mongoose.model("AIBehaviorLog", aiBehaviorLogSchema);
