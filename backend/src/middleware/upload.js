import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const basename = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${basename}${ext}`);
  }
});

const fileFilter = (_req, file, cb) => {
  const allowed = (process.env.ALLOWED_IMAGE_MIME || "image/jpeg,image/png,image/webp").split(",");
  cb(null, allowed.includes(file.mimetype));
};

export const uploadProductImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: (Number(process.env.MAX_UPLOAD_MB) || 8) * 1024 * 1024 }
}).fields([{ name: "images", maxCount: 8 }]);

export const uploadKyc = multer({
  storage,
  fileFilter,
  limits: { fileSize: (Number(process.env.MAX_UPLOAD_MB) || 8) * 1024 * 1024 }
}).fields([
  { name: "idCardImage", maxCount: 1 },
  { name: "selfieWithId", maxCount: 1 }
]);

// Single image upload for dashboard announcements
export const uploadDashboardImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: (Number(process.env.MAX_UPLOAD_MB) || 8) * 1024 * 1024 }
}).single("image");

// Single image upload for news
export const uploadNewsImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: (Number(process.env.MAX_UPLOAD_MB) || 8) * 1024 * 1024 }
}).single("image");
