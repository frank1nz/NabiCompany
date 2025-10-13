import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import leadRoutes from "./routes/lead.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import productRoutes from "./routes/product.routes.js";
import productAdminRoutes from "./routes/product.admin.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);          
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/users", userRoutes);

// Serve static files for uploads (so images can be accessed via URL)
app.use("/uploads", express.static(process.env.UPLOAD_DIR || "uploads"));

// default route
app.get("/", (req, res) => res.json({ message: "Welcome to Nabi backend" }));

connectDB(process.env.MONGO_URI).then(() => {
  app.listen(process.env.PORT || 5000, () =>
    console.log(`Server running on http://localhost:${process.env.PORT || 5000}`)
  );
});
