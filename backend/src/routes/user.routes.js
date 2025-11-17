import express from "express";
import { verifyJWT } from "../middleware/auth.js";
import { requireSelfOrAdmin } from "../middleware/role.js";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controller.js";

const router = express.Router();

// GET /api/users/:id  → เจ้าของดูตัวเอง หรือ admin ดูใครก็ได้
router.get("/:id", verifyJWT, requireSelfOrAdmin, getUserProfile);

// PATCH /api/users/:id  → เจ้าของหรือ admin แก้ไขข้อมูลบางส่วน
router.patch("/:id", verifyJWT, requireSelfOrAdmin, updateUserProfile);

export default router;
