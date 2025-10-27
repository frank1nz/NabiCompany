import mongoose from "mongoose";

const kycSchema = new mongoose.Schema({
  idCardImagePath: String,       
  selfieWithIdPath: String,      
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: Date,
  note: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user", required: true },

  profile: {
    name: { type: String, required: true },
    dob:  { type: Date, required: true },
    phone: String,
    lineId: String,
    facebookProfileUrl: String,
    address: String,
  },

  ageVerified: { type: Boolean, default: false }, // คำนวณจาก dob >= AGE_MIN
  kyc: kycSchema
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });


userSchema.virtual("isVerified").get(function () {
  return this.ageVerified && this.kyc?.status === "approved";
});
export default mongoose.model("User", userSchema);
