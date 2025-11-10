const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Loaded Cloudinary credentials:", {
  name: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY ? "✅ Loaded" : "❌ Missing",
  secret: process.env.CLOUDINARY_API_SECRET ? "✅ Loaded" : "❌ Missing"
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "where-to-go/avatars",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };
