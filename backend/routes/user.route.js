import express from "express"
import { registerUser, loginUser, refreshToken, logout, getUserProfile, updateUserProfile, addAddress, updateAddress, deleteAddress, addRecentlyViewed, getRecentlyViewed, getWishlist, toggleWishlist } from "../controllers/user.controller.js"
import protect from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/profile", protect, getUserProfile)
router.put("/profile", protect, updateUserProfile)
router.post("/address", protect, addAddress)
router.put("/address/:addressId", protect, updateAddress)
router.delete("/address/:addressId", protect, deleteAddress)
router.get("/wishlist", protect, getWishlist)
router.post("/wishlist/:productId", protect, toggleWishlist)
router.post("/recently-viewed", protect, addRecentlyViewed)
router.get("/recently-viewed", protect, getRecentlyViewed)
export default router;