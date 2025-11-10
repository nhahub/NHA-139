const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listingController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// Routes
router.post("/", protect, listingController.createListing);
router.get("/", protect, restrictTo("admin"), listingController.getAllListings);
router.patch("/:id", protect, restrictTo("admin"), listingController.updateListingStatus);
router.get("/my", protect, listingController.getMyListings);

module.exports = router;
