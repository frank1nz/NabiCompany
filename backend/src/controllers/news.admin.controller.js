import News from "../models/News.js";

export async function adminListNews(req, res) {
  const { q, includeDeleted } = req.query || {};
  const filter = {};
  if (!includeDeleted) filter.deletedAt = null;
  if (q && String(q).trim()) {
    filter.$text = { $search: String(q).trim() };
  }
  const rows = await News.find(filter).sort({ priority: -1, createdAt: -1 }).lean();
  res.json(rows.map((n) => ({
    id: n._id,
    title: n.title,
    description: n.description,
    image: n.image,
    status: n.status,
    visibility: n.visibility,
    priority: n.priority,
    startsAt: n.startsAt,
    endsAt: n.endsAt,
    deletedAt: n.deletedAt,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  })));
}

export async function adminCreateNews(req, res) {
  const body = req.body || {};
  const image = req.file?.path || (req.files?.image?.[0]?.path) || "";
  const doc = await News.create({
    title: String(body.title || "").trim(),
    description: String(body.description || ""),
    image,
    status: ["active", "inactive"].includes(body.status) ? body.status : "active",
    visibility: ["public", "hidden"].includes(body.visibility) ? body.visibility : "public",
    priority: isFinite(Number(body.priority)) ? Number(body.priority) : 0,
    startsAt: body.startsAt ? new Date(body.startsAt) : null,
    endsAt: body.endsAt ? new Date(body.endsAt) : null,
    deletedAt: null,
    createdBy: req.user?.id || undefined,
    updatedBy: req.user?.id || undefined,
  });
  res.status(201).json(doc);
}

export async function adminUpdateNews(req, res) {
  const { id } = req.params;
  const body = req.body || {};
  const update = {};
  if (typeof body.title !== "undefined") update.title = String(body.title || "").trim();
  if (typeof body.description !== "undefined") update.description = String(body.description || "");
  if (typeof body.status !== "undefined" && ["active", "inactive"].includes(body.status)) update.status = body.status;
  if (typeof body.visibility !== "undefined" && ["public", "hidden"].includes(body.visibility)) update.visibility = body.visibility;
  if (typeof body.priority !== "undefined" && isFinite(Number(body.priority))) update.priority = Number(body.priority);
  if (typeof body.startsAt !== "undefined") update.startsAt = body.startsAt ? new Date(body.startsAt) : null;
  if (typeof body.endsAt !== "undefined") update.endsAt = body.endsAt ? new Date(body.endsAt) : null;
  if (req.file?.path || req.files?.image?.[0]?.path) update.image = req.file?.path || req.files?.image?.[0]?.path;
  update.updatedBy = req.user?.id || undefined;

  if (!Object.keys(update).length) return res.status(400).json({ message: "ไม่มีข้อมูลสำหรับอัปเดต" });

  const doc = await News.findByIdAndUpdate(id, update, { new: true });
  if (!doc) return res.status(404).json({ message: "ไม่พบข่าว" });
  res.json(doc);
}

export async function adminSoftDeleteNews(req, res) {
  const { id } = req.params;
  const doc = await News.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
  if (!doc) return res.status(404).json({ message: "ไม่พบข่าว" });
  res.json({ ok: true });
}

export async function adminRestoreNews(req, res) {
  const { id } = req.params;
  const doc = await News.findByIdAndUpdate(id, { deletedAt: null }, { new: true });
  if (!doc) return res.status(404).json({ message: "ไม่พบข่าว" });
  res.json(doc);
}

export async function adminHardDeleteNews(req, res) {
  const { id } = req.params;
  const deleted = await News.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "ไม่พบข่าว" });
  res.status(204).end();
}

