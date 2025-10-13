import User from "../models/User.js";

export function requireAgeVerified(req, res, next) {
  const ageVerified =
    req.user?.ageVerified ?? req.userDb?.ageVerified ?? req.dbUser?.ageVerified;
  if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
  if (!ageVerified) return res.status(403).json({ message: "Age not verified" });
  next();
}

export async function requireKycApproved(req, res, next) {
  // โหลด user สดจาก DB เผื่อสถานะเพิ่งถูกอนุมัติ
  const preloaded = req.dbUser || req.userDb;
  const user = preloaded || (await User.findById(req.user.id).lean());
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  const status = user.kyc?.status || "pending";
  if (status !== "approved") return res.status(403).json({ message: "KYC not approved" });
  req.userDb = user;
  req.dbUser = user;
  next();
}
