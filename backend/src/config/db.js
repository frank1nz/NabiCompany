import mongoose from "mongoose";

export async function connectDB() {
  mongoose.set("strictQuery", true);

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGO_DB_NAME || "test";

  if (!uri) {
    throw new Error("❌ MONGODB_URI is not defined in environment variables");
  }

  try {
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 10000, // 10 วินาที timeout
    });

    console.log("✅ MongoDB connected to", dbName);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err; // ให้ server.js จัดการต่อ
  }
}
