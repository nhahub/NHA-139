const express = require("express");
const placeController = require("./../controllers/placeController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

router = express.Router();

// router.get("/test-apify", placeController.testApifyConnection);
// router.post("/fetch-apify", placeController.fetchPlacesFromApify);
// router.get("/distribution", placeController.getPlacesDistribution);


router.get("/search", placeController.getFilteredPlaces);


router.post("/", protect, restrictTo("admin"), placeController.createNewPlace);

router
  .route("/:id")
  .get(placeController.getPlace) // public view
  .patch(protect, restrictTo("admin"), placeController.updatePlace)
  .delete(protect, restrictTo("admin"), placeController.deletePlace);


router.get("/", placeController.getAllPlaces);
module.exports = router;
