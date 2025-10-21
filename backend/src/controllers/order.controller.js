import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { generatePromptPayPayload } from "../utils/promptpay.js";

const MAX_QTY_PER_ITEM = Number.isFinite(Number(process.env.CART_ITEM_MAX_QTY))
  ? Number(process.env.CART_ITEM_MAX_QTY)
  : 99;
const QR_EXPIRE_MINUTES = Number.isFinite(Number(process.env.PROMPTPAY_QR_EXPIRE_MINUTES))
  ? Number(process.env.PROMPTPAY_QR_EXPIRE_MINUTES)
  : 30;

function clampQuantity(value) {
  const qty = Math.floor(Number(value) || 0);
  if (!Number.isFinite(qty) || qty <= 0) return 0;
  return Math.min(qty, MAX_QTY_PER_ITEM);
}

async function ensureCart(userId) {
  const existing = await Cart.findOne({ user: userId });
  if (existing) return existing;
  return Cart.create({ user: userId, items: [] });
}

async function findActiveProduct(productId) {
  return Product.findOne({
    _id: productId,
    status: "active",
    visibility: "public",
    deletedAt: null,
  }).lean();
}

async function buildCartPayload(userId) {
  const cart = await Cart.findOne({ user: userId }).lean();
  if (!cart || !cart.items?.length) {
    return {
      items: [],
      totals: { amount: 0, quantity: 0 },
      updatedAt: cart?.updatedAt || null,
    };
  }

  const productIds = cart.items
    .map((item) => item.product)
    .filter((id) => mongoose.Types.ObjectId.isValid(id));

  if (!productIds.length) {
    return {
      items: [],
      totals: { amount: 0, quantity: 0 },
      updatedAt: cart.updatedAt,
    };
  }

  const products = await Product.find({
    _id: { $in: productIds },
    status: "active",
    visibility: "public",
    deletedAt: null,
  }).lean();

  const productsById = new Map(products.map((p) => [p._id.toString(), p]));
  const validItems = [];
  const invalidTargets = [];

  for (const item of cart.items) {
    const productId = item.product?.toString?.() || String(item.product || "");
    if (!mongoose.Types.ObjectId.isValid(productId)) continue;
    const product = productsById.get(productId);
    if (!product) {
      invalidTargets.push(new mongoose.Types.ObjectId(productId));
      continue;
    }

    const quantity = clampQuantity(item.quantity);
    if (quantity <= 0) {
      invalidTargets.push(new mongoose.Types.ObjectId(productId));
      continue;
    }

    const unitPrice = Number(product.price || 0);
    validItems.push({
      productId,
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
      product: {
        id: productId,
        name: product.name,
        description: product.description,
        price: unitPrice,
        images: product.images || [],
        sku: product.sku || null,
        slug: product.slug || null,
      },
    });
  }

  if (invalidTargets.length) {
    await Cart.updateOne(
      { _id: cart._id },
      { $pull: { items: { product: { $in: invalidTargets } } } }
    );
  }

  const totals = validItems.reduce(
    (acc, item) => {
      acc.amount += item.lineTotal;
      acc.quantity += item.quantity;
      return acc;
    },
    { amount: 0, quantity: 0 }
  );

  return { items: validItems, totals, updatedAt: cart.updatedAt };
}

export async function getCart(req, res) {
  const payload = await buildCartPayload(req.user.id);
  res.json(payload);
}

export async function addCartItem(req, res) {
  const { productId, quantity = 1 } = req.body;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid productId" });
  }

  const product = await findActiveProduct(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not available" });
  }

  const qty = clampQuantity(quantity || 1);
  if (qty <= 0) {
    return res.status(400).json({ message: "Quantity must be greater than zero" });
  }

  const cart = await ensureCart(req.user.id);
  const existing = cart.items.findIndex((item) => item.product.toString() === productId);
  if (existing >= 0) {
    cart.items[existing].quantity = clampQuantity(cart.items[existing].quantity + qty);
  } else {
    cart.items.push({ product: product._id, quantity: qty });
  }

  await cart.save();
  const payload = await buildCartPayload(req.user.id);
  res.json(payload);
}

export async function updateCartItem(req, res) {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid productId" });
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  const index = cart.items.findIndex((item) => item.product.toString() === productId);
  if (index === -1) {
    return res.status(404).json({ message: "Item not in cart" });
  }

  const qty = clampQuantity(quantity);
  if (qty <= 0) {
    cart.items.splice(index, 1);
  } else {
    cart.items[index].quantity = qty;
  }

  await cart.save();
  const payload = await buildCartPayload(req.user.id);
  res.json(payload);
}

export async function removeCartItem(req, res) {
  const { productId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid productId" });
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  const nextItems = cart.items.filter((item) => item.product.toString() !== productId);
  cart.items = nextItems;
  await cart.save();

  const payload = await buildCartPayload(req.user.id);
  res.json(payload);
}

export async function clearCart(req, res) {
  await Cart.findOneAndUpdate({ user: req.user.id }, { $set: { items: [] } }, { upsert: false });
  res.json({
    items: [],
    totals: { amount: 0, quantity: 0 },
    updatedAt: new Date(),
  });
}

export async function checkoutCart(req, res) {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart || !cart.items.length) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const cartPayload = await buildCartPayload(req.user.id);
  if (!cartPayload.items.length) {
    await Cart.updateOne({ _id: cart._id }, { $set: { items: [] } });
    return res.status(400).json({ message: "Cart is empty" });
  }

  const total = cartPayload.totals.amount;
  if (total <= 0) {
    return res.status(400).json({ message: "Total amount must be greater than zero" });
  }

  const user = req.userDb || (await User.findById(req.user.id).lean());
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  const rawAddress =
    (req.body.shippingAddress ?? "").toString().trim() ||
    user.profile?.address?.toString()?.trim();

  if (!rawAddress) {
    return res.status(400).json({ message: "Shipping address is required" });
  }

  const shippingAddress = rawAddress.slice(0, 600);
  const promptPayTargetRaw = process.env.PROMPTPAY_ID;
  const promptPayType = process.env.PROMPTPAY_PROXY_TYPE || "auto";
  const promptPayBankCode = process.env.PROMPTPAY_BANK_CODE || "";
  const promptPayTarget = promptPayTargetRaw;
  if (!promptPayTarget) {
    return res
      .status(500)
      .json({ message: "PromptPay is not configured on the server" });
  }

  const orderItems = cartPayload.items.map((item) => ({
    product: new mongoose.Types.ObjectId(item.productId),
    name: item.product?.name || "สินค้า",
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }));

  const orderId = new mongoose.Types.ObjectId();
  const reference = `NB${orderId.toString().slice(-10).toUpperCase()}`;
  let payload;
  let proxyInfo;
  try {
    proxyInfo = generatePromptPayPayload({
      target: promptPayTarget,
      amount: total,
      reference,
      merchantName: process.env.PROMPTPAY_MERCHANT_NAME || "NABI SPIRITS",
      merchantCity: process.env.PROMPTPAY_MERCHANT_CITY || "BANGKOK",
      targetType: promptPayType,
      bankCode: promptPayBankCode,
    });
    payload = proxyInfo.payload;
  } catch (error) {
    console.error("Failed to generate PromptPay QR payload", error);
    return res.status(400).json({
      message:
        error?.message ||
        "Cannot generate PromptPay QR code. Please verify PromptPay configuration.",
    });
  }

  const expiresAt = new Date(Date.now() + QR_EXPIRE_MINUTES * 60 * 1000);

  const order = await Order.create({
    _id: orderId,
    user: req.user.id,
    channel: "web",
    status: "pending",
    items: orderItems,
    note: req.body.note,
    total,
    shippingAddress,
    payment: {
      method: "promptpay",
      status: "pending",
      amount: total,
      currency: "THB",
      reference,
      target: promptPayTargetRaw,
      targetFormatted: proxyInfo?.proxyId ?? null,
      payload,
      expiresAt,
    },
  });

  await Cart.updateOne({ _id: cart._id }, { $set: { items: [] } });

  res.status(201).json({
    order: {
      id: order._id,
      status: order.status,
      total: order.total,
      note: order.note,
      shippingAddress: order.shippingAddress,
      payment: order.payment,
      items: order.items,
      channel: order.channel,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    },
    cart: {
      items: [],
      totals: { amount: 0, quantity: 0 },
    },
    message: "Order created. Please complete payment via PromptPay.",
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
      shippingAddress: order.shippingAddress,
      payment: order.payment,
      items: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }))
  );
}
