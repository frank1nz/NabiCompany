import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { uploadProductImages } from "../middleware/upload.js";
import {
  adminListProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminReplaceImages,
  adminSoftDeleteProduct,
  adminRestoreProduct,
  adminHardDeleteProduct
} from "../controllers/product.admin.controller.js";

const r = Router();

// ต้องเป็น admin ทุกเส้น
r.use(verifyJWT, requireRole("admin"));

r.get("/", adminListProducts);
r.post("/", uploadProductImages, adminCreateProduct);
r.put("/:id", uploadProductImages, adminUpdateProduct);

// ทางเลือกเมื่อต้องการแทนที่รูปทั้งหมดทีเดียว
r.put("/:id/images", uploadProductImages, adminReplaceImages);

// ลบแบบ soft/hard
r.delete("/:id", adminSoftDeleteProduct);     // soft delete
r.delete("/:id/hard", adminHardDeleteProduct); // hard delete (ระวัง!)
r.put("/:id/restore", adminRestoreProduct);   // กู้คืน soft delete

export default r;
