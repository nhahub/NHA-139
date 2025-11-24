const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.protect = async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = req.headers.authorization.split(" ")[1];
  // console.log("🔹 Received Token:", token);
  // console.log("🔹 Secret Used:", process.env.JWT_SECRET);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("🔹 Decoded Payload:", decoded);

    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    console.error(" JWT Verify Error:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to perform this action" });
    }
    next();
  };
};
