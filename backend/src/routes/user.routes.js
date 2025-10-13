import express from "express";
import { verifyJWT } from "../middleware/auth.js";
import { requireSelfOrAdmin } from "../middleware/role.js";
import { getUserProfile } from "../controllers/user.controller.js";

const router = express.Router();

// GET /api/users/:id  → เจ้าของดูตัวเอง หรือ admin ดูใครก็ได้
router.get("/users/:id", verifyJWT, requireSelfOrAdmin, getUserProfile);

export default router;
