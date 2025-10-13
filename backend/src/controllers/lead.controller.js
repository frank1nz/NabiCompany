import Lead from "../models/Lead.js";

export async function createLead(req, res) {
  const { message, preferredChannel } = req.body;
  const userId = req.user.id;

  const lead = await Lead.create({
    fromUserId: userId,
    name: req.userProfile?.name, // ถ้าคุณ preload profile
    email: req.userEmail,
    source: "web_form",
    preferredChannel,
    status: "new",
    consent: { pdpaAccepted: true, timestamp: new Date() },
    ageVerified: true
  });

  // TODO: แจ้งเตือนแอดมินผ่าน Email/LINE Notify
  res.status(201).json({ id: lead._id, status: lead.status });
}
