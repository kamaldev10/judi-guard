// src/server.js
const app = require("./app");
const connectDB = require("./config/database");
const config = require("./config/environment");
const loadResources = require("./loadResources");

const startServer = async () => {
  try {
    // await loadResources();
    await connectDB(); // Hubungkan ke database
    app.listen(config.port, () => {
      console.log(`Server is listening on http://localhost:${config.port} 🎧`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server 😭:", error);
    process.exit(1);
  }
};

startServer();
