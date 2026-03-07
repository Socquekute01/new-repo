import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Role from "../models/Role.js";
import connectDB from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function seedManagerRole() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Check if manager role exists
    const existingManager = await Role.findOne({ name: "manager" });
    if (existingManager) {
      console.log("✅ Manager role already exists");
      process.exit(0);
    }

    // Create manager role
    const managerRole = await Role.create({
      name: "manager",
      description:
        "Manager role with access to dashboard, orders, and products management",
      permissions: [],
    });

    console.log("✅ Manager role created successfully:", managerRole);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding manager role:", error);
    process.exit(1);
  }
}

seedManagerRole();
