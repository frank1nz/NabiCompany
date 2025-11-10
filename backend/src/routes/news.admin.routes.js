import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { uploadNewsImage } from "../middleware/upload.js";
import {
  adminListNews,
  adminCreateNews,
  adminUpdateNews,
  adminSoftDeleteNews,
  adminRestoreNews,
  adminHardDeleteNews,
} from "../controllers/news.admin.controller.js";

const r = Router();

r.use(verifyJWT, requireRole("admin"));
r.get("/", adminListNews);
r.post("/", uploadNewsImage, adminCreateNews);
r.put("/:id", uploadNewsImage, adminUpdateNews);
r.delete("/:id", adminSoftDeleteNews);
r.put("/:id/restore", adminRestoreNews);
r.delete("/:id/hard", adminHardDeleteNews);

export default r;

