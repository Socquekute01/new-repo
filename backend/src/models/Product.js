import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters"],
        maxlength: [100, "Name must be at most 100 characters"],
    },
    // Backward compatibility with old API
    title: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price must be >= 0"],
    },
    stock: {
        type: Number,
        required: [true, "Stock is required"],
        min: [0, "Stock must be >= 0"],
    },
    images: {
        type: [String],
        default: [],
    },
    size: [{
        type: String,
        trim: true,
    }],
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Category is required"],
    },
}, {
    timestamps: true
});

productSchema.pre("validate", function() {
    if (!this.name && this.title) {
        this.name = this.title;
    }
});

export default mongoose.model("Product", productSchema);
