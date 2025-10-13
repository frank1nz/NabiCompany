import Product from "../models/Product.js";

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
  const { name, description, price, status = "active", tags = [], visibility = "public" } = req.body;
  const images = (req.files?.images || []).map(f => f.path);

  const doc = await Product.create({ name, description, price, status, tags, images, visibility });
  res.status(201).json(doc);
}

export async function adminUpdateProduct(req, res) {
  const { id } = req.params;
  const payload = { ...req.body };
  // ถ้ามีรูปใหม่แนบมา ให้ merge ต่อท้าย/หรือแทนที่ตามที่ต้องการ
  if (req.files?.images?.length) {
    const newImages = req.files.images.map(f => f.path);
    // ตัวเลือก A: ต่อท้าย
    payload.$push = { images: { $each: newImages } };
    // ตัวเลือก B (แทนที่ทั้งชุด): payload.images = newImages;
  }

  const updated = await Product.findByIdAndUpdate(id, payload, { new: true });
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
}

export async function adminReplaceImages(req, res) {
  const { id } = req.params;
  const images = (req.files?.images || []).map(f => f.path);
  const updated = await Product.findByIdAndUpdate(id, { images }, { new: true });
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
}

export async function adminSoftDeleteProduct(req, res) {
  const { id } = req.params;
  const updated = await Product.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json({ ok: true });
}

export async function adminRestoreProduct(req, res) {
  const { id } = req.params;
  const updated = await Product.findByIdAndUpdate(id, { deletedAt: null }, { new: true });
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
}

export async function adminHardDeleteProduct(req, res) {
  // ควรใช้ระวัง! ลบทิ้งจาก DB (และอาจต้องลบไฟล์รูปใน storage ด้วย)
  const { id } = req.params;
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "Not found" });
  res.status(204).end();
}
