import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, default: 1, min: 1 },
    unitPrice: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    channel: { type: String, enum: ["line", "web"], default: "web" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "fulfilled", "cancelled"],
      default: "pending",
    },
    items: { type: [orderItemSchema], default: [] },
    note: String,
    total: { type: Number, default: 0, min: 0 },
    adminNote: String,
    shippingAddress: String,
    payment: {
      method: { type: String, enum: ["promptpay"], default: "promptpay" },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "expired"],
        default: "pending",
      },
      amount: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: "THB" },
      reference: String,
      target: String,
      targetFormatted: String,
      payload: String,
      generatedAt: { type: Date, default: Date.now },
      expiresAt: Date,
      paidAt: Date,
    },
    meta: {
      lineUserId: String,
      lineMessageId: String,
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
