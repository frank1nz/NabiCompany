import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  userStats,
  listUsers,
  orderStats,
  approveKyc,
  rejectKyc,
  listKycPending,
} from "../controllers/admin.controller.js";

const r = Router();

// admin-only & read-only
r.get("/stats/users", verifyJWT, requireRole("admin"), userStats);
r.get("/users", verifyJWT, requireRole("admin"), listUsers);
r.get("/stats/orders", verifyJWT, requireRole("admin"), orderStats);

// 👇 เพิ่มส่วนตรวจและอนุมัติ KYC
r.get("/kyc/pending", verifyJWT, requireRole("admin"), listKycPending);
r.put("/kyc/:userId/approve", verifyJWT, requireRole("admin"), approveKyc);
r.put("/kyc/:userId/reject", verifyJWT, requireRole("admin"), rejectKyc);

export default r;
