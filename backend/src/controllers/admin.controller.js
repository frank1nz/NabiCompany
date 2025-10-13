import User from "../models/User.js";
import Order from "../models/Order.js";

export async function userStats(req, res) {
  const counts = await User.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } }
  ]);
  res.json({ counts });
}

export async function listUsers(req, res) {
  const users = await User.find({}, { passwordHash: 0 }).lean();
  res.json(users);
}

export async function orderStats(req, res) {
  const agg = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 }, revenue: { $sum: "$total" } } }
  ]);
  res.json({ orders: agg });
}

export async function listOrders(_req, res) {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate("user", "email role profile.name")
    .lean();

  res.json(
    orders.map((order) => ({
      id: order._id,
      status: order.status,
      total: order.total,
      channel: order.channel,
      adminNote: order.adminNote,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: order.user
        ? {
            id: order.user._id,
            email: order.user.email,
            role: order.user.role,
            name: order.user.profile?.name,
          }
        : null,
      items: order.items?.map((item) => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    }))
  );
}

export async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status, adminNote } = req.body;
  const allowedStatuses = ["pending", "confirmed", "rejected", "fulfilled", "cancelled"];
  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const updatePayload = {};
  if (status) updatePayload.status = status;
  if (typeof adminNote === "string") updatePayload.adminNote = adminNote;

  if (!Object.keys(updatePayload).length) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  const order = await Order.findByIdAndUpdate(id, updatePayload, { new: true })
    .populate("user", "email role profile.name")
    .lean();
  if (!order) return res.status(404).json({ message: "Order not found" });

  res.json({
    id: order._id,
    status: order.status,
    total: order.total,
    channel: order.channel,
    adminNote: order.adminNote,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    user: order.user
      ? {
          id: order.user._id,
          email: order.user.email,
          role: order.user.role,
          name: order.user.profile?.name,
        }
      : null,
    items: order.items?.map((item) => ({
      product: item.product,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  });
}

export async function listKycPending(_req, res) {
  const users = await User.find({ "kyc.status": "pending" }, { passwordHash: 0 }).lean();
  res.json(users);
}

export async function approveKyc(req, res) {
  const { userId } = req.params;
  await User.findByIdAndUpdate(userId, {
    $set: {
      "kyc.status": "approved",
      "kyc.reviewedBy": req.user.id,
      "kyc.reviewedAt": new Date(),
    },
  });
  res.json({ ok: true });
}

export async function rejectKyc(req, res) {
  const { userId } = req.params;
  const { note } = req.body;
  await User.findByIdAndUpdate(userId, {
    $set: {
      "kyc.status": "rejected",
      "kyc.reviewedBy": req.user.id,
      "kyc.reviewedAt": new Date(),
      "kyc.note": note,
    },
  });
  res.json({ ok: true });
}

