export function requireAgeVerified(req, res, next) {
  if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
  if (!req.user?.ageVerified) return res.status(403).json({ message: "Age not verified" });
  next();
}

export async function requireKycApproved(req, res, next) {
  // โหลด user สดจาก DB เผื่อสถานะเพิ่งถูกอนุมัติ
  const user = req.dbUser || req.userDb; // ถ้ามี preload
  const u = user || (await req.models.User.findById(req.user.id).lean());
  if (!u) return res.status(401).json({ message: "Unauthorized" });
  if (u.kyc?.status !== "approved") return res.status(403).json({ message: "KYC not approved" });
  next();
}
