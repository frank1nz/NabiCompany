import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { requireKycApproved } from "../middleware/requireVerifiedUser.js";
import { createLineOrder, listMyOrders } from "../controllers/order.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/me", requireRole("user", "admin"), listMyOrders);
router.post("/line", requireRole("user"), requireKycApproved, createLineOrder);

export default router;
