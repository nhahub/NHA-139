const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listingController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");


// User routes
router.post("/submit", protect, listingController.createListing);
router.put("/:id/own", protect, listingController.updateOwnListing);
router.delete("/:id/own", protect, listingController.deleteOwnListing);
router.get("/my", protect, listingController.getMyListings);


// Admin-only routes
router.use(protect, restrictTo("admin")); // all routes below are admin-only
router.post("/", listingController.adminCreateListing);     // create
router.get("/", listingController.getAllListings);          // view all
router.put("/:id", listingController.updateListing);        // update
router.delete("/:id", listingController.deleteListing);     // delete
router.patch("/:id/status", listingController.updateListingStatus); // approve/reject


module.exports = router;
