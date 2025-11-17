import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import leadRoutes from "./routes/lead.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import productRoutes from "./routes/product.routes.js";
import productAdminRoutes from "./routes/product.admin.routes.js";
import newsAdminRoutes from "./routes/news.admin.routes.js";
import newsRoutes from "./routes/news.routes.js";
import userRoutes from "./routes/user.routes.js";
import publicRoutes from "./routes/public.routes.js";
import orderRoutes from "./routes/order.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// public routes
app.use("/", publicRoutes);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/admin/news", newsAdminRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

// static uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
const UPLOAD_PATH = path.join(process.cwd(), UPLOAD_DIR);
app.use("/uploads", express.static(UPLOAD_PATH));

// 🔹 เริ่ม server หลังต่อ Mongo สำเร็จ
const start = async () => {
  try {
    await connectDB();   // 👈 ไม่ต้องส่ง URI แล้ว
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

start();
