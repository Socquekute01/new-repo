import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        maxlength: [100, "Name must be at most 100 characters"],
    },
    description: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true
});

export default mongoose.model("Category", categorySchema);
