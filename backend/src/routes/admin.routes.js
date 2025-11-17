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
  listOrders,
  updateOrderStatus,
} from "../controllers/admin.controller.js";

const r = Router();

r.get("/stats/users", verifyJWT, requireRole("admin"), userStats);
r.get("/users", verifyJWT, requireRole("admin"), listUsers);
r.get("/stats/orders", verifyJWT, requireRole("admin"), orderStats);
r.get("/orders", verifyJWT, requireRole("admin"), listOrders);
r.patch("/orders/:id", verifyJWT, requireRole("admin"), updateOrderStatus);

r.get("/kyc/pending", verifyJWT, requireRole("admin"), listKycPending);
r.put("/kyc/:userId/approve", verifyJWT, requireRole("admin"), approveKyc);
r.put("/kyc/:userId/reject", verifyJWT, requireRole("admin"), rejectKyc);

export default r;
