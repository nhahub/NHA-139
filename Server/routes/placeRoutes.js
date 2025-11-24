const express = require("express");
const placeController = require("./../controllers/placeController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

router = express.Router();

// router.get("/test-apify", placeController.testApifyConnection);
// router.post("/fetch-apify", placeController.fetchPlacesFromApify);

router.get("/search", protect, placeController.getFilteredPlaces);
router.route("/:id").get(protect, placeController.getPlace);
router.get("/", placeController.getAllPlaces);
// router.get("/", protect, restrictTo("admin"), placeController.getAllPlaces);

module.exports = router;
