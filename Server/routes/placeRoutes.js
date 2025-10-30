const express = require("express");
const placeController = require("./../controllers/placeController");

router = express.Router();

router.get("/search", placeController.searchPlaces);
router.get("/test-apify", placeController.testApifyConnection);
router.post("/fetch-apify", placeController.fetchPlacesFromApify);
router.get("/distribution", placeController.getPlacesDistribution);

router
  .route("/")
  .get(placeController.getAllPlaces)
  .post(placeController.createNewPlace);

router
  .route("/:id")
  .get(placeController.getPlace)
  .patch(placeController.updatePlace)
  .delete(placeController.deletePlace);

module.exports = router;
