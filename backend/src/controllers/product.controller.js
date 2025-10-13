import Product from "../models/Product.js";

export async function listProducts(req, res) {
  const { q, tag } = req.query;

  const filter = { status: "active", visibility: "public", deletedAt: null };
  if (q)   filter.$text = { $search: q };
  if (tag) filter.tags  = tag;

  const products = await Product.find(filter).lean();
  res.json(products);
}

export async function getProduct(req, res) {
  const p = await Product.findOne({
    _id: req.params.id,
    status: "active",
    visibility: "public",
    deletedAt: null
  }).lean();
  if (!p) return res.status(404).json({ message: "Not found" });
  res.json(p);
}