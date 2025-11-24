const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listingController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// User Routes (Protected)
router.use(protect);

router.post("/submit", listingController.createListing);
router.get("/my", listingController.getMyListings);

router
  .route("/:id/own")
  .put(listingController.updateOwnListing)
  .delete(listingController.deleteOwnListing);

// Admin Routes (Restricted)
router.use(restrictTo("admin"));

router
  .route("/")
  .post(listingController.adminCreateListing)
  .get(listingController.getAllListings);

router
  .route("/:id")
  .get(listingController.getListingById)
  .put(listingController.updateListing)
  .delete(listingController.deleteListing);

router.patch("/:id/status", listingController.updateListingStatus);

module.exports = router;
