// var express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const authRoutes = require("./src/routes/authRoutes"); // ✅ import
// const app = express();

// app.use(cors());
// app.use(express.json());

// // ✅ YAHAN MongoDB connect hoga
// mongoose.connect("mongodb://127.0.0.1:27017/eventSphereDB")
// .then(() => console.log("MongoDB Connected"))
// .catch(err => console.log(err));

// app.use("/api/auth", authRoutes);

// app.get("/", (req, res) => {
//   res.send("pakistan zindabad");
// });

// app.listen(5000, () => {
//   console.log("Server running on port 5000");
// });