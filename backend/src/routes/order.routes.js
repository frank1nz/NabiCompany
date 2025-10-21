import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { requireKycApproved } from "../middleware/requireVerifiedUser.js";
import {
  addCartItem,
  checkoutCart,
  clearCart,
  getCart,
  listMyOrders,
  removeCartItem,
  updateCartItem,
} from "../controllers/order.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/me", requireRole("user", "admin"), listMyOrders);

router.use("/cart", requireRole("user"), requireKycApproved);
router.get("/cart", getCart);
router.post("/cart/items", addCartItem);
router.patch("/cart/items/:productId", updateCartItem);
router.delete("/cart/items/:productId", removeCartItem);
router.delete("/cart", clearCart);
router.post("/cart/checkout", checkoutCart);

export default router;
