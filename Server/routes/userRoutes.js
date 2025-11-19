const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// User profile routes
router.get("/me", protect, userController.getMyProfile);
router.put("/update", protect, userController.updateProfile);

// Favorites routes
router
  .route("/favorites")
  .get(protect, userController.getFavorites)
  .post(protect, userController.addFavorite);
router.delete("/favorites/:listingId", protect, userController.removeFavorite);

// History routes
router
  .route("/history")
  .post(protect, userController.addToHistory)
  .delete(protect, userController.clearHistory);

// Admin Routes
router
  .route("/")
  .get(protect, restrictTo("admin"), userController.getAllUsers)
  .post(protect, restrictTo("admin"), userController.addUser);

router
  .route("/:id")
  .put(protect, restrictTo("admin"), userController.updateUser)
  .delete(protect, restrictTo("admin"), userController.deleteUser);

module.exports = router;
