import express from "express";
import {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/admin.controller.js";
import { upload } from "../middleware/multer.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply protection to all admin routes
router.use(protect);
router.use(adminOnly);

router.get("/stats", getDashboardStats);
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);
router.get("/users", getAllUsers);

// Support both JSON URLs and single file upload
router.post("/product", upload.single("image"), createProduct);
router.post("/products", upload.single("image"), createProduct);
router.put("/products/:id", upload.single("image"), updateProduct);
router.delete("/products/:id", deleteProduct);

export default router;