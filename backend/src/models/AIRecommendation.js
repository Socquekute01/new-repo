import mongoose from "mongoose";

const aiRecommendationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 1,
    },
}, {
    timestamps: true
});

export default mongoose.model("AIRecommendation", aiRecommendationSchema);
