import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        minlength: [3, "Username must be at least 3 characters"],
        maxlength: [30, "Username must be at most 30 characters"],
    },
    name: {
        type: String,
        trim: true,
        minlength: [2, "Name must be at least 2 characters"],
        maxlength: [50, "Name must be at most 50 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false,
    },
    phone: {
        type: String,
        trim: true,
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, trim: true },
        zip: { type: String, trim: true },
    },
    role: {
        type: String,
        enum: ["user", "admin", "manager", "staff"],
        default: "user",
    },
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
    }],
}, {
    timestamps: true
});

userSchema.pre("validate", function() {
    if (!this.name && this.username) {
        this.name = this.username;
    }
});

userSchema.pre("save", async function() {
    if (!this.isModified("password")) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
