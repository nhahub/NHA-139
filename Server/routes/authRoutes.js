const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");
const { upload } = require("../config/cloudinary");

router.post("/signup", upload.single("avatar"), signup);
router.post("/login", login);

module.exports = router;
