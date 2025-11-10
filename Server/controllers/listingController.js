const Listing = require("../models/listingModel");
const Place = require("../models/placeModel");

// Create listing (when user submits a place)
exports.createListing = async (req, res) => {
  try {
    const newPlace = await Place.create(req.body);

    const listing = await Listing.create({
      place: newPlace._id,
      owner: req.user._id,
    });

    res.status(201).json({
      message: "Listing created and pending approval",
      listing,
    });
  } catch (error) {
    res.status(400).json({ message: "failed", error: error.message });
  }
};

// Get all listings (for admin dashboard)
exports.getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate("place")
      .populate("owner", "name email");

    res.status(200).json({
      message: "success",
      result: listings.length,
      data: listings,
    });
  } catch (error) {
    res.status(500).json({ message: "failed", error: error.message });
  }
};

// Approve / Reject a listing
exports.updateListingStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    );

    res.status(200).json({ message: "Listing status updated", listing });
  } catch (error) {
    res.status(400).json({ message: "failed", error: error.message });
  }
};

// Get listings for a specific owner (user profile)
exports.getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id })
      .populate("place");

    res.status(200).json({ message: "success", data: listings });
  } catch (error) {
    res.status(500).json({ message: "failed", error: error.message });
  }
};
