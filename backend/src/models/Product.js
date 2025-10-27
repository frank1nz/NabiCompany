import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    images: { type: [String], default: [] }, // เก็บ URL หรือ path
    price: { type: Number, default: 0 },    // แสดงราคาอ้างอิง (ไม่ใช้ขายจริง)
    stock: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    tags: { type: [String], default: [] },
    visibility: { type: String, enum: ["public", "hidden"], default: "public" }, // ซ่อนชั่วคราว
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

productSchema.index(
  { name: "text", description: "text", tags: "text" },
  { name: "ProductTextIdx", weights: { name: 10, tags: 5, description: 2 } }
);


export default mongoose.model("Product", productSchema);
