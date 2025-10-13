import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User.js";

dotenv.config();

async function run() {
  try {
    const email = process.env.SEED_ADMIN_EMAIL || "admin@nabi.com";
    const plain = process.env.SEED_ADMIN_PASSWORD || "admin123";
    const name  = process.env.SEED_ADMIN_NAME || "System Admin";

    await mongoose.connect(process.env.MONGO_URI);

    const exists = await User.findOne({ email }).lean();
    if (exists) {
      console.log(`Admin already exists: ${email}`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(plain, 10);

    const admin = await User.create({
      email,
      passwordHash,
      role: "admin",
      profile: {
        name,
        dob: new Date("1990-01-01"),
      },
      ageVerified: true,
      kyc: { status: "approved" } // ให้พร้อมใช้งานเลย
    });

    console.log("Admin created:");
    console.log("email:", admin.email);
    console.log("pass :", plain);
    process.exit(0);
  } catch (e) {
    console.error("❌ Seed admin failed:", e);
    process.exit(1);
  }
}

run();
