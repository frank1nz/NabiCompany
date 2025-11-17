// config/db.js
import mongoose from "mongoose";
import Product from "../models/Product.js";

export async function connectDB(uri) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("MongoDB connected");

  // ให้ Mongoose เปรียบเทียบ index ใน DB กับที่กำหนดใน schema แล้วซิงค์ให้ตรงกัน
  // (จะลบดัชนีที่ schema ไม่มี และสร้างดัชนีที่ขาด)
  // await Product.syncIndexes();
  // console.log("Product indexes synced");
}
