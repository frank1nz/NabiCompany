import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function verifyJWT(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "No token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET); // { sub, role? }
    const user = await User.findById(payload.sub).lean();
    if (!user) return res.status(401).json({ message: "Invalid user" });

    // เก็บ info สั้นๆ ที่ใช้บ่อย
    req.user = { id: user._id.toString(), role: user.role };
    // แนบ user เต็มๆ เผื่อ middleware อื่นใช้ (ageVerified/kyc/status)
    req.userDb = user;

    next();
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
