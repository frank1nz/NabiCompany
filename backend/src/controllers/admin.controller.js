import User from "../models/User.js";

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

