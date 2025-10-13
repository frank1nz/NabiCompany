import User from "../models/User.js";

export async function getUserProfile(req, res) {
  try {
    const { id } = req.params;
    const doc = await User.findById(id).select("-password -__v").lean();
    if (!doc) return res.status(404).json({ message: "User not found" });

    res.json({
      id: doc._id,
      name: doc.name,
      email: doc.email,
      role: doc.role,
      age: doc.age,
      verified: doc.verified ?? (doc.kyc?.status === "approved"),
      kycStatus: doc.kyc?.status ?? (doc.verified ? "approved" : "pending"),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}
