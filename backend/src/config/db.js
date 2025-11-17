import mongoose from "mongoose";

export async function connectDB(uri) {
  mongoose.set("strictQuery", true);

  const dbName = process.env.MONGO_DB_NAME || "test"; // 👈 ถ้าไม่ตั้ง env จะใช้ test เป็นค่า default

  await mongoose.connect(uri, { dbName });           // 👈 ให้ mongoose เลือก DB จากตรงนี้
  console.log("MongoDB connected to", dbName);

  // ไม่ต้อง syncIndexes แล้ว ถ้าคุณลบออกไปแล้วก็โอเค
  // await Product.syncIndexes();
  // console.log("Product indexes synced");
}
