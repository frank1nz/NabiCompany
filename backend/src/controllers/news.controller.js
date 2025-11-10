import News from "../models/News.js";

export async function listPublicNews(_req, res) {
  const now = new Date();
  const filter = {
    deletedAt: null,
    status: "active",
    visibility: "public",
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
    ],
  };

  const rows = await News.find(filter)
    .sort({ priority: -1, startsAt: -1, createdAt: -1 })
    .lean();

  res.json(
    rows.map((n) => ({
      id: n._id,
      title: n.title,
      description: n.description,
      image: n.image,
      startsAt: n.startsAt,
      endsAt: n.endsAt,
      priority: n.priority,
      createdAt: n.createdAt,
    }))
  );
}

