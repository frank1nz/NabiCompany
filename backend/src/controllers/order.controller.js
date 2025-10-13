import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

function parseItems(rawItems = []) {
  if (!Array.isArray(rawItems)) return [];
  return rawItems
    .map((item) => {
      if (typeof item !== "object" || !item) return null;
      const productId = item.productId || item.product || item.id;
      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) return null;
      const quantity = Number(item.quantity || 1);
      return {
        productId,
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      };
    })
    .filter(Boolean);
}

export async function createLineOrder(req, res) {
  const items = parseItems(req.body.items);
  if (!items.length) {
    return res.status(400).json({ message: "items array (productId, quantity) is required" });
  }

  // ดึงข้อมูลสินค้าเพื่อเก็บ snapshot ตอนออเดอร์ถูกสร้าง
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({
    _id: { $in: productIds },
    status: "active",
    visibility: "public",
    deletedAt: null,
  }).lean();

  const productsById = new Map(products.map((p) => [p._id.toString(), p]));

  const orderItems = items
    .map(({ productId, quantity }) => {
      const product = productsById.get(productId.toString());
      if (!product) return null;
      return {
        product: product._id,
        name: product.name,
        quantity,
        unitPrice: product.price || 0,
      };
    })
    .filter(Boolean);

  if (!orderItems.length) {
    return res.status(400).json({ message: "No valid products found for this order" });
  }

  const total = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const order = await Order.create({
    user: req.user.id,
    channel: "line",
    status: "pending",
    items: orderItems,
    note: req.body.note,
    total,
    meta: {
      lineUserId: req.body.lineUserId,
      lineMessageId: req.body.lineMessageId,
    },
  });

  res.status(201).json({
    id: order._id,
    status: order.status,
    total,
    items: orderItems,
    message: "Order submitted. Staff will confirm via LINE.",
  });
}

export async function listMyOrders(req, res) {
  const orders = await Order.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .lean();

  res.json(
    orders.map((order) => ({
      id: order._id,
      status: order.status,
      channel: order.channel,
      total: order.total,
      note: order.note,
      items: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }))
  );
}
