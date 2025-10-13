import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { differenceInYears } from "date-fns";
import User from "../models/User.js";

const AGE_MIN = Number(process.env.AGE_MIN || 20);

function redirectBase(role) {
  return role === "admin" ? "/admin" : "/app";
}

export async function registerWithKyc(req, res) {
  try {
    const { email, password, name, dob, phone, lineId, facebookProfileUrl } = req.body;

    // ตรวจไฟล์
    const idCard = req.files?.idCardImage?.[0];
    const selfie = req.files?.selfieWithId?.[0];
    if (!idCard || !selfie) return res.status(400).json({ message: "Both images are required" });

    // ตรวจซ้ำ email
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already used" });

    // คำนวณอายุ
    const birthDate = new Date(dob);
    if (isNaN(birthDate)) return res.status(400).json({ message: "Invalid dob date" });
    const age = differenceInYears(new Date(), birthDate);
    const ageVerified = age >= AGE_MIN;

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      passwordHash,
      role: "user", // 🔒 ล็อกไว้ ไม่รับ role จาก client
      profile: { name, dob: birthDate, phone, lineId, facebookProfileUrl },
      ageVerified,
      kyc: {
        idCardImagePath: idCard.path,
        selfieWithIdPath: selfie.path,
        status: "pending"
      }
    });

    const token = jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES || "7d"
    });

    const kycStatus = user.kyc?.status || "pending";
    res.status(201).json({
      token,
      user: {
        id: user._id, email: user.email, role: user.role,
        ageVerified: user.ageVerified,
        kycStatus,
        kyc: {
          status: kycStatus,
          idCardImagePath: user.kyc?.idCardImagePath,
          selfieWithIdPath: user.kyc?.selfieWithIdPath,
        },
        isVerified: user.ageVerified && kycStatus === "approved",
        canOrderViaLine: user.ageVerified && kycStatus === "approved",
      },
      nextStep: user.ageVerified
        ? "Await admin KYC review"
        : `Age must be >= ${AGE_MIN}`,
      redirectBase: redirectBase(user.role)
    });
  } catch (e) {
    res.status(500).json({ message: "Register error" });
  }
}


export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "7d" }
    );

    const kycStatus = user.kyc?.status || "pending";
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        ageVerified: user.ageVerified,
        kycStatus,
        kyc: {
          status: kycStatus,
          idCardImagePath: user.kyc?.idCardImagePath,
          selfieWithIdPath: user.kyc?.selfieWithIdPath,
          reviewedAt: user.kyc?.reviewedAt,
          reviewedBy: user.kyc?.reviewedBy,
          note: user.kyc?.note,
        },
        isVerified: user.ageVerified && kycStatus === "approved",
        canOrderViaLine: user.ageVerified && kycStatus === "approved",
      },
      redirectBase: user.role === "admin" ? "/admin" : "/app/profile",
      nextStep:
        user.role === "admin"
          ? "Go to admin dashboard"
          : user.kyc?.status === "approved"
            ? "Ready to create lead"
            : "Please wait for verification approval",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Login error" });
  }
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.user.id, { passwordHash: 0 }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const kycStatus = user.kyc?.status || "pending";
    const kycPayload = user.kyc
      ? {
          status: kycStatus,
          idCardImagePath: user.kyc.idCardImagePath,
          selfieWithIdPath: user.kyc.selfieWithIdPath,
          reviewedAt: user.kyc.reviewedAt,
          reviewedBy: user.kyc.reviewedBy,
          note: user.kyc.note,
        }
      : { status: kycStatus };

    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      profile: {
        name: user.profile?.name,
        dob: user.profile?.dob,
        phone: user.profile?.phone,
        lineId: user.profile?.lineId,
        facebookProfileUrl: user.profile?.facebookProfileUrl,
      },
      ageVerified: user.ageVerified,
      kycStatus,
      kyc: kycPayload,
      isVerified: user.ageVerified && kycStatus === "approved",
      canOrderViaLine: user.ageVerified && kycStatus === "approved",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    console.error("Error fetching /me:", err);
    res.status(500).json({ message: "Server error" });
  }
}
