import User from "../models/User.js";

function buildProfileResponse(doc) {
  const kycStatus = doc.kyc?.status || "pending";
  return {
    id: doc._id,
    email: doc.email,
    role: doc.role,
    profile: {
      name: doc.profile?.name,
      dob: doc.profile?.dob,
      phone: doc.profile?.phone,
      lineId: doc.profile?.lineId,
      facebookProfileUrl: doc.profile?.facebookProfileUrl,
      address: doc.profile?.address,
    },
    ageVerified: doc.ageVerified,
    kycStatus,
    kyc: doc.kyc
      ? {
          status: kycStatus,
          idCardImagePath: doc.kyc.idCardImagePath,
          selfieWithIdPath: doc.kyc.selfieWithIdPath,
          reviewedAt: doc.kyc.reviewedAt,
          reviewedBy: doc.kyc.reviewedBy,
          note: doc.kyc.note,
        }
      : { status: kycStatus },
    isVerified: doc.ageVerified && kycStatus === "approved",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function getUserProfile(req, res) {
  try {
    const { id } = req.params;
    const doc = await User.findById(id, { passwordHash: 0, __v: 0 }).lean();
    if (!doc) return res.status(404).json({ message: "User not found" });

    res.json(buildProfileResponse(doc));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateUserProfile(req, res) {
  try {
    const { id } = req.params;
    const { phone, address } = req.body || {};

    const update = {};
    if (typeof phone !== "undefined") update["profile.phone"] = phone;
    if (typeof address !== "undefined") update["profile.address"] = address;

    const doc = await User.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true, context: "query" }
    ).lean();

    if (!doc) return res.status(404).json({ message: "User not found" });

    res.json(buildProfileResponse(doc));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}
