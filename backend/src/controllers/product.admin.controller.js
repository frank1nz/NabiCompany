import path from "path";
import Product from "../models/Product.js";

const ALLOWED_STATUS = ["active", "inactive"];
const ALLOWED_VISIBILITY = ["public", "hidden"];

// ใช้ชื่อโฟลเดอร์ upload จาก env แต่บังคับให้เป็น path แบบเว็บ (ไม่ขึ้นต้นด้วย / และใช้ / เสมอ)
const UPLOAD_DIR_WEB = (process.env.UPLOAD_DIR || "uploads")
  .replace(/\\/g, "/")
  .replace(/^\.?\/*/, "") || "uploads";

function firstValue(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parsePrice(value) {
  const raw = firstValue(value);
  const num = Number(raw);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.round(num * 100) / 100;
}

function parseStock(value) {
  const raw = firstValue(value);
  const num = Number(raw);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.floor(num);
}

function normalizeTags(body = {}) {
  const raw = body["tags[]"] ?? body.tags;
  if (!raw) return [];
  const source = Array.isArray(raw) ? raw : String(raw).split(",");
  return source
    .map((tag) => String(tag).trim())
    .filter((tag) => tag.length > 0);
}

function fileToImagePath(file) {
  if (!file) return null;
  const filename = file.filename || path.basename(file.path || "");
  if (!filename) return null;
  return `${UPLOAD_DIR_WEB}/${filename}`.replace(/\\/g, "/");
}

export async function adminListProducts(req, res) {
  const { q, tag, status, visibility, includeDeleted } = req.query;
  const filter = {};
  if (q) filter.$text = { $search: q };
  if (tag) filter.tags = tag;
  if (status) filter.status = status;
  if (visibility) filter.visibility = visibility;
  if (!includeDeleted) filter.deletedAt = null;

  const items = await Product.find(filter).lean();
  res.json(items);
}

export async function adminCreateProduct(req, res) {
  const name = String(firstValue(req.body?.name) || "").trim();
  if (!name) {
    return res.status(400).json({ message: "ชื่อสินค้าจำเป็นต้องระบุ" });
  }

  const description = String(firstValue(req.body?.description) || "");
  const price = parsePrice(req.body?.price);
  const stock = parseStock(req.body?.stock);
  const rawStatus = firstValue(req.body?.status);
  const status = ALLOWED_STATUS.includes(rawStatus) ? rawStatus : "active";
  const rawVisibility = firstValue(req.body?.visibility);
  const visibility = ALLOWED_VISIBILITY.includes(rawVisibility) ? rawVisibility : "public";
  const tags = normalizeTags(req.body);
  const images = (req.files?.images || [])
    .map(fileToImagePath)
    .filter((p) => typeof p === "string" && p.length > 0);

  const doc = await Product.create({
    name,
    description,
    price,
    stock,
    status,
    visibility,
    tags,
    images,
  });
  res.status(201).json(doc);
}

export async function adminUpdateProduct(req, res) {
  const { id } = req.params;
  const update = {};

  if (typeof req.body?.name !== "undefined") {
    const name = String(firstValue(req.body.name) || "").trim();
    if (!name) {
      return res.status(400).json({ message: "ชื่อสินค้าจำเป็นต้องระบุ" });
    }
    update.name = name;
  }

  if (typeof req.body?.description !== "undefined") {
    update.description = String(firstValue(req.body.description) || "");
  }

  if (typeof req.body?.price !== "undefined") {
    update.price = parsePrice(req.body.price);
  }

  if (typeof req.body?.stock !== "undefined") {
    update.stock = parseStock(req.body.stock);
  }

  if (typeof req.body?.status !== "undefined") {
    const rawStatus = firstValue(req.body.status);
    if (!ALLOWED_STATUS.includes(rawStatus)) {
      return res.status(400).json({ message: "สถานะสินค้าไม่ถูกต้อง" });
    }
    update.status = rawStatus;
  }

  if (typeof req.body?.visibility !== "undefined") {
    const rawVisibility = firstValue(req.body.visibility);
    if (!ALLOWED_VISIBILITY.includes(rawVisibility)) {
      return res.status(400).json({ message: "Visibility ไม่ถูกต้อง" });
    }
    update.visibility = rawVisibility;
  }

  if (typeof req.body?.tags !== "undefined" || typeof req.body?.["tags[]"] !== "undefined") {
    update.tags = normalizeTags(req.body);
  }

  const updateDoc = { ...update };

  if (req.files?.images?.length) {
    const newImages = req.files.images
      .map(fileToImagePath)
      .filter((p) => typeof p === "string" && p.length > 0);

    if (newImages.length) {
      updateDoc.$push = { images: { $each: newImages } };
    }
  }

  if (!Object.keys(updateDoc).length) {
    return res.status(400).json({ message: "ไม่มีข้อมูลสำหรับอัปเดต" });
  }

  const updated = await Product.findByIdAndUpdate(id, updateDoc, { new: true });
  if (!updated) return res.status(404).json({ message: "ไม่พบสินค้า" });
  res.json(updated);
}

export async function adminReplaceImages(req, res) {
  const { id } = req.params;
  const images = (req.files?.images || [])
    .map(fileToImagePath)
    .filter((p) => typeof p === "string" && p.length > 0);
  const updated = await Product.findByIdAndUpdate(id, { images }, { new: true });
  if (!updated) return res.status(404).json({ message: "ไม่พบสินค้า" });
  res.json(updated);
}

export async function adminSoftDeleteProduct(req, res) {
  const { id } = req.params;
  const updated = await Product.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
  if (!updated) return res.status(404).json({ message: "ไม่พบสินค้า" });
  res.json({ ok: true });
}

export async function adminRestoreProduct(req, res) {
  const { id } = req.params;
  const updated = await Product.findByIdAndUpdate(id, { deletedAt: null }, { new: true });
  if (!updated) return res.status(404).json({ message: "ไม่พบสินค้า" });
  res.json(updated);
}

export async function adminHardDeleteProduct(req, res) {
  const { id } = req.params;
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "ไม่พบสินค้า" });
  res.status(204).end();
}
