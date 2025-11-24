const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// Middlewares
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Routes
const placeRoutes = require("./routes/placeRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const listingRoutes = require("./routes/listingRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/v1/places", placeRoutes);
app.use("/api/listings", listingRoutes);

module.exports = app;
