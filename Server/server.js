const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const app = require("./app");
require("./config/cloudinary");

connectDB();

const PORT = process.env.PORT || 5000;
console.log("Loaded JWT Secret:", process.env.JWT_SECRET); 

app.listen(PORT, () => console.log(`--- Server running on port ${PORT}`));
