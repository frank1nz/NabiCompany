import { Router } from "express";
import { registerWithKyc,login,me } from "../controllers/auth.controller.js";
import { uploadKyc } from "../middleware/upload.js";
import { verifyJWT } from "../middleware/auth.js";

const r = Router();
r.post("/register", uploadKyc, registerWithKyc);
r.post("/login", login);
r.get("/me", verifyJWT,me);
export default r;
