import { Router } from "express";
import { listProducts, getProduct } from "../controllers/product.controller.js";
import { registerWithKyc, login, me } from "../controllers/auth.controller.js";
import { uploadKyc } from "../middleware/upload.js";
import { verifyJWT } from "../middleware/auth.js";

const router = Router();

const homepage = (_req, res) =>
  res.json({
    message: "Welcome to Nabi backend",
    paths: {
      homepage: "/homepage",
      products: "/products",
      login: "/login",
      register: "/register",
    },
  });

router.get("/", homepage);
router.get("/homepage", homepage);

router.get("/products", listProducts);
router.get("/products/:id", getProduct);

router.post("/register", uploadKyc, registerWithKyc);
router.post("/login", login);
router.get("/profile", verifyJWT, me);

export default router;
