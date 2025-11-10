import { Router } from "express";
import { listPublicNews } from "../controllers/news.controller.js";

const r = Router();
r.get("/", listPublicNews);
export default r;

