import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
    key: {
        type: String,
        required: [true, "Permission key is required"],
        unique: true,
        trim: true,
        lowercase: true,
    },
    description: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true
});

export default mongoose.model("Permission", permissionSchema);