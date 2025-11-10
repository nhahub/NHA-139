const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

// Protected routes
router.get("/me", protect, userController.getMyProfile);
router.get("/favorites", protect, userController.getFavorites);

router.put("/update", protect, userController.updateProfile);

router.post("/favorites", protect, userController.addFavorite);
router.delete("/favorites/:listingId", protect, userController.removeFavorite);

router.post("/history", protect, userController.addToHistory);
router.delete("/history", protect, userController.clearHistory);

module.exports = router;
