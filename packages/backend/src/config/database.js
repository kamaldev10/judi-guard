// src/config/database.js
const mongoose = require("mongoose");
const config = require("./environment");

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("MongoDB Connected successfully! 🎉");
  } catch (err) {
    console.error("MongoDB Connection Error 😟:", err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
