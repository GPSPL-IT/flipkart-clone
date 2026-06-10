import express from "express"
import {
    registerUser,
    loginUser,
    refreshToken,
    logout,
    getUserProfile,
    updateUserProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    addRecentlyViewed,
    getRecentlyViewed,
    getWishlist,
    toggleWishlist,
    getUserNotifications,
    markNotificationRead,
    deleteNotification,
    addSavedCard,
    deleteSavedCard,
    addWalletFunds,
    redeemGiftCard
} from "../controllers/user.controller.js"
import protect from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/profile", protect, getUserProfile)
router.put("/profile", protect, updateUserProfile)

// Addresses (support both singular and plural)
router.post("/address", protect, addAddress)
router.post("/addresses", protect, addAddress)
router.put("/address/:addressId", protect, updateAddress)
router.put("/addresses/:addressId", protect, updateAddress)
router.delete("/address/:addressId", protect, deleteAddress)
router.delete("/addresses/:addressId", protect, deleteAddress)

router.get("/wishlist", protect, getWishlist)
router.post("/wishlist/:productId", protect, toggleWishlist)
router.post("/recently-viewed", protect, addRecentlyViewed)
router.get("/recently-viewed", protect, getRecentlyViewed)

// Notifications
router.get("/notifications", protect, getUserNotifications);
router.put("/notifications/:id/read", protect, markNotificationRead);
router.delete("/notifications/:id", protect, deleteNotification);

// Saved Cards
router.post("/cards", protect, addSavedCard);
router.delete("/cards/:cardId", protect, deleteSavedCard);

// Wallet & Gift cards
router.post("/wallet/add", protect, addWalletFunds);
router.post("/giftcards/redeem", protect, redeemGiftCard);

export default router;