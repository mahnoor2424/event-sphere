const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./src/models/User");

mongoose.connect("mongodb://127.0.0.1:27017/Eproject");

async function createAdmin() {
  const adminExist = await User.findOne({ role: "admin" });

  if (!adminExist) {
    const hash = await bcrypt.hash("123456", 10);

    await User.create({
      name: "Admin",
      email: "mahnoor.aptech24@gmail.com",
      password: hash,
      role: "admin"
    });

    console.log("✅ Admin Created");
  } else {
    console.log("⚡ Admin Already Exists");
  }

  mongoose.connection.close();
}

createAdmin();