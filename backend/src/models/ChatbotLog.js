import mongoose from "mongoose";

const chatbotLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    response: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true
});

export default mongoose.model("ChatbotLog", chatbotLogSchema);
