import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const STAFF_EMAIL = process.env.STAFF_EMAIL || "staff@example.com";
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || "staff123";
const STAFF_USERNAME = process.env.STAFF_USERNAME || "staff";

const seedStaff = async () => {
  try {
    await connectDB();

    // Find existing user by email or username
    let user = await User.findOne({
      $or: [{ email: STAFF_EMAIL }, { username: STAFF_USERNAME }],
    });

    if (!user) {
      // Create new staff user
      user = new User({
        username: STAFF_USERNAME,
        name: STAFF_USERNAME,
        email: STAFF_EMAIL,
        password: STAFF_PASSWORD,
        role: "staff",
      });
      await user.save();
      console.log("✅ Staff user created");
    } else {
      // Update existing user to staff role
      user.role = "staff";

      // Update email if different
      if (user.email !== STAFF_EMAIL) {
        user.email = STAFF_EMAIL;
      }

      await user.save();
      console.log("✅ Staff user updated");
    }

    console.log("\n📋 Staff credentials:");
    console.log(`   Email: ${STAFF_EMAIL}`);
    console.log(`   Password: ${STAFF_PASSWORD}`);
    console.log(`   Username: ${STAFF_USERNAME}`);
    console.log(`   Role: staff\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed staff:", error);
    process.exit(1);
  }
};

seedStaff();
