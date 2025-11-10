const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// Middlewares
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Routes
const placesRoutes = require("./routes/placeRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const listing = require("./routes/listingRoute");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/v1/places", placesRoutes);
app.use("/api/listing", listing);

module.exports = app;
