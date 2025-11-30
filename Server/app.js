const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");

// Middlewares
const app = express();
app.use(express.json());
app.use(mongoSanitize());
app.use(
  cors({
    origin: ["https://where-to-go.vercel.app", "http://localhost:8080/"],
    credentials: true,
  })
);
app.use(morgan("dev"));

// Routes
const placeRoutes = require("./routes/placeRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const listingRoutes = require("./routes/listingRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/listings", listingRoutes);

module.exports = app;
