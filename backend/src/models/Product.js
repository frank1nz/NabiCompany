import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    images: { type: [String], default: [] }, // เก็บ URL หรือ path
    price: { type: Number, default: 0 },    // แสดงราคาอ้างอิง (ไม่ใช้ขายจริง)
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    tags: { type: [String], default: [] },

    visibility: { type: String, enum: ["public", "hidden"], default: "public" }, // ซ่อนชั่วคราว
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// index เบา ๆ เพื่อค้นหาชื่อ/แท็กได้
productSchema.index({ name: "text", tags: 1 });

export default mongoose.model("Product", productSchema);
