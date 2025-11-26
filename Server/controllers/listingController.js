const Listing = require("../models/listingModel");
const Place = require("../models/placeModel");

// Admin actions

// Create listing (admin)
exports.adminCreateListing = async (req, res) => {
  try {
    const newPlace = await Place.create(req.body);

    const listing = await Listing.create({
      place: newPlace._id,
      owner: req.user._id, // admin is owner
      status: "accepted", // auto-approved
    });

    res.status(201).json({
      message: "Listing created by admin",
      listing,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create listing", error: error.message });
  }
};

// Get all listings (admin)
exports.getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate("place")
      .populate("owner", "name email");

    res.status(200).json({
      message: "Success",
      result: listings.length,
      data: listings,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch listings", error: error.message });
  }
};

// Get a specific listing by ID (Admin)
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("place")
      .populate("owner", "name email");

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json({
      message: "Success",
      data: listing,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch listing", error: error.message });
  }
};

// Update listing (admin)
exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const place = await Place.findByIdAndUpdate(listing.place, req.body, {
      new: true,
    });

    res.status(200).json({ message: "Listing updated", listing, place });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update listing", error: error.message });
  }
};

// Delete listing (admin)
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    await Place.findByIdAndDelete(listing.place);
    await Listing.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Listing deleted" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to delete listing", error: error.message });
  }
};

// Admin approve/reject listing
exports.updateListingStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    // Find the listing
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // Do NOT delete if rejected. Just update status.
    listing.status = status;
    listing.adminNote = adminNote || listing.adminNote;
    listing.needsReview = false;

    await listing.save();

    res.status(200).json({
      message: `Listing ${status} successfully`,
      listing,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update listing status",
      error: error.message,
    });
  }
};

// User actions

// Create listing (user)
exports.createListing = async (req, res) => {
  try {
    const newPlace = await Place.create(req.body);

    const listing = await Listing.create({
      place: newPlace._id,
      owner: req.user._id,
      status: "pending",
    });

    res.status(201).json({
      message: "Listing created and pending approval",
      listing,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create listing", error: error.message });
  }
};

// // Update own listing (User) - Resets status to PENDING
exports.updateOwnListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // Security: Check ownership
    if (listing.owner.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "You can only update your own listings" });

    // Allowed editing 'rejected' listings so they can be fixed

    // Update Place details
    const place = await Place.findByIdAndUpdate(listing.place, req.body, {
      new: true,
      runValidators: true,
    });

    // Reset status to 'pending' for re-approval
    listing.status = "pending";
    listing.needsReview = true;

    // Clear old admin note so it doesn't look rejected anymore
    listing.adminNote = "";

    await listing.save();

    res.status(200).json({
      message: "Listing updated and resubmitted for approval",
      listing,
      place,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update listing", error: error.message });
  }
};

// Delete own listing (after approval)
exports.deleteOwnListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.owner.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "You can only delete your own listings" });

    if (listing.status !== "accepted")
      return res
        .status(403)
        .json({ message: "Listing must be accepted to delete" });

    await Place.findByIdAndDelete(listing.place);
    await Listing.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Listing deleted" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to delete listing", error: error.message });
  }
};

// Get all listings of the logged-in user
exports.getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id }).populate(
      "place"
    );
    res.status(200).json({ message: "Success", data: listings });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch listings", error: error.message });
  }
};
