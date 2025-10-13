import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import { requireAgeVerified, requireKycApproved } from "../middleware/requireVerifiedUser.js";
import { createLead } from "../controllers/lead.controller.js";

const r = Router();
// ต้องล็อกอิน + ผ่านอายุ + (ถ้ากำหนด) ผ่าน KYC
r.post("/", verifyJWT, requireAgeVerified, requireKycApproved, createLead);
export default r;
