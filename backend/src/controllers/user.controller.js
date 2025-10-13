import User from "../models/User.js";

export async function getUserProfile(req, res) {
  try {
    const { id } = req.params;
    const doc = await User.findById(id, { passwordHash: 0, __v: 0 }).lean();
    if (!doc) return res.status(404).json({ message: "User not found" });

    const kycStatus = doc.kyc?.status || "pending";
    res.json({
      id: doc._id,
      email: doc.email,
      role: doc.role,
      profile: {
        name: doc.profile?.name,
        dob: doc.profile?.dob,
        phone: doc.profile?.phone,
        lineId: doc.profile?.lineId,
        facebookProfileUrl: doc.profile?.facebookProfileUrl,
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
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}
