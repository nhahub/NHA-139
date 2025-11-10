// controllers/userController.js
const mongoose = require("mongoose");
const User = require("../models/User");
const Place = require("../models/placeModel"); 
const Listing = require("../models/listingModel"); 

// Admin actions
exports.addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role });
    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// User actions

// helper to return populated user doc
const getPopulatedUser = async (userId) => {
  return await User.findById(userId)
    .populate("favorites") 
    .populate("history");  
};

// GET CURRENT USER PROFILE (with populated favorites & history)
exports.getMyProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id)
      return res.status(401).json({ message: "Unauthorized" });

    const user = await getPopulatedUser(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "success", data: { user } });
  } catch (error) {
    return res.status(500).json({ message: "failed", error: error.message });
  }
};

// UPDATE USER PROFILE (name, photo)
exports.updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id)
      return res.status(401).json({ message: "Unauthorized" });

    const { name } = req.body;
    const updateData = {};

    if (typeof name === "string" && name.trim() !== "")
      updateData.name = name.trim();
    if (req.file && req.file.path) {
      updateData.profilePicture = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    });
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    return res.status(400).json({ message: "failed", error: error.message });
  }
};

// GET ALL FAVORITES (populated)
exports.getFavorites = async (req, res) => {
  try {
    if (!req.user || !req.user._id)
      return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(req.user._id).populate("favorites"); 

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "success",
      result: user.favorites.length,
      data: user.favorites,
    });
  } catch (err) {
    return res.status(500).json({ message: "failed", error: err.message });
  }
};

// ADD TO FAVORITES
exports.addFavorite = async (req, res) => {
  try {
    if (!req.user || !req.user._id)
      return res.status(401).json({ message: "Unauthorized" });

    const { placeId } = req.body; 
    if (!placeId) return res.status(400).json({ message: "placeId required" });
    if (!mongoose.Types.ObjectId.isValid(placeId))
      return res.status(400).json({ message: "Invalid placeId" });

    // Fetch place
    const place = await Place.findById(placeId);
    if (!place) return res.status(404).json({ message: "Place not found" });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { favorites: place._id } },
      { new: true }
    ).populate("favorites");

    return res
      .status(200)
      .json({ message: "Added to favorites", data: updatedUser.favorites });
  } catch (error) {
    return res.status(400).json({ message: "failed", error: error.message });
  }
};

// REMOVE FROM FAVORITES
exports.removeFavorite = async (req, res) => {
  try {
    if (!req.user || !req.user._id)
      return res.status(401).json({ message: "Unauthorized" });

    const { listingId } = req.params;
    if (!listingId)
      return res.status(400).json({ message: "listingId required" });
    if (!mongoose.Types.ObjectId.isValid(listingId))
      return res.status(400).json({ message: "Invalid listingId" });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { favorites: listingId } },
      { new: true }
    ).populate("favorites");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    return res
      .status(200)
      .json({ message: "Removed from favorites", data: updatedUser.favorites });
  } catch (error) {
    return res.status(400).json({ message: "failed", error: error.message });
  }
};

// ADD TO HISTORY
exports.addToHistory = async (req, res) => {
  try {
    if (!req.user || !req.user._id)
      return res.status(401).json({ message: "Unauthorized" });

    const { placeId } = req.body;
    if (!placeId) return res.status(400).json({ message: "placeId required" });

    if (!mongoose.Types.ObjectId.isValid(placeId))
      return res.status(400).json({ message: "Invalid placeId" });

    const place = await Place.findById(placeId);
    if (!place) return res.status(404).json({ message: "Place not found" });

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { history: place._id },
    });

    let updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { history: { $each: [place._id], $position: 0 } } },
      { new: true }
    ).populate("history"); ;

    if (updatedUser && updatedUser.history.length > 50) {
      const keepIds = updatedUser.history
        .slice(0, 50)
        .map((h) => (h._id ? h._id : h));
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { history: keepIds },
        { new: true }
      ).populate("history");
    }

    return res.status(200).json({
      message: "Added to history",
      data: updatedUser ? updatedUser.history : [],
    });
  } catch (error) {
    return res.status(400).json({ message: "failed", error: error.message });
  }
};

// CLEAR HISTORY
exports.clearHistory = async (req, res) => {
  try {
    if (!req.user || !req.user._id)
      return res.status(401).json({ message: "Unauthorized" });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { history: [] },
      { new: true }
    ).populate({ path: "history", populate: { path: "place" } });

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    return res
      .status(200)
      .json({ message: "History cleared", data: updatedUser.history });
  } catch (error) {
    return res.status(400).json({ message: "failed", error: error.message });
  }
};
