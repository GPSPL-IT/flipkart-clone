import express from "express"
import { registerUser, loginUser, refreshToken, logout, getUserProfile, updateUserProfile, addAddress, updateAddress, deleteAddress } from "../controllers/user.controller.js"
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

export default router;