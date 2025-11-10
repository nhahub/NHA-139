const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect,restrictTo } = require("../middlewares/authMiddleware");

// Protected routes
router.post('/', protect, restrictTo('admin'), userController.addUser);
router.put('/:id', protect, restrictTo('admin'), userController.updateUser);
router.delete('/:id', protect, restrictTo('admin'), userController.deleteUser);

router.get("/me", protect, userController.getMyProfile);
router.get("/favorites", protect, userController.getFavorites);

router.put("/update", protect, userController.updateProfile);

router.post("/favorites", protect, userController.addFavorite);
router.delete("/favorites/:listingId", protect, userController.removeFavorite);

router.post("/history", protect, userController.addToHistory);
router.delete("/history", protect, userController.clearHistory);

module.exports = router;
