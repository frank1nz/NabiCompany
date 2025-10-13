import User from "../models/User.js";

/** ใช้เมื่อจำเป็นต้องเช็ค "อายุผ่าน" จาก flag เฉพาะ */
export function requireAgeVerified(req, res, next) {
  // ใช้ req.userDb ถ้ามี (จาก verifyJWT) เพื่อลด query
  const u = req.userDb;
  if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
  const ok = u?.ageVerified === true;
  if (!ok) return res.status(403).json({ message: "Age not verified" });
  next();
}

/** ใช้เมื่อจำเป็นต้องเช็ค KYC status เป็น approved */
export async function requireKycApproved(req, res, next) {
  if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
  // ถ้ามี preload แล้วใช้เลย ไม่งั้นค่อยโหลด
  let u = req.userDb;
  if (!u) u = await User.findById(req.user.id).lean();
  if (!u) return res.status(401).json({ message: "Unauthorized" });

  const status = u.kyc?.status || (u.verified ? "approved" : "pending");
  if (status !== "approved") return res.status(403).json({ message: "KYC not approved" });

  next();
}
