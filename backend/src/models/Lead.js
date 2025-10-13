import mongoose from "mongoose";
const leadSchema = new mongoose.Schema({
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  email: String,
  phone: String,
  lineId: String,
  message: String,
  preferredChannel: { type: String, enum: ["email", "phone", "line"] },
  source: { type: String, default: "web_form" },
  status: { type: String, enum: ["new","contacted","qualified","closed","invalid"], default: "new" },
  consent: {
    pdpaAccepted: { type: Boolean, default: true },
    timestamp: Date,
    ip: String,
    userAgent: String
  },
  ageVerified: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Lead", leadSchema);
