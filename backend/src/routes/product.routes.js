// src/routes/product.routes.js
import { Router } from "express";
import { listProducts, getProduct } from "../controllers/product.controller.js";

const r = Router();

// Public (ไม่ต้อง JWT)
r.get("/", listProducts);
r.get("/:id", getProduct);

export default r;
