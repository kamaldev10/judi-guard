// src/server.js
const app = require('./app');
const connectDB = require('./config/database');
const config = require('./config/environment');

const startServer = async () => {
  try {
    await connectDB();

    app.listen(config.port, () => {
      const isProduction = process.env.NODE_ENV === 'production';

      console.log('========================================');

      if (isProduction) {
        console.log('🚀 Server started successfully!');
        console.log(`🌍 Environment : ${process.env.NODE_ENV}`);
        console.log(`🔌 Port        : ${config.port}`);

        // Opsional jika memiliki APP_URL di .env
        if (process.env.APP_URL) {
          console.log(`🔗 URL         : ${process.env.APP_URL}`);
        }
      } else {
        console.log('🚀 Server started successfully!');
        console.log(`🌍 Environment : development`);
        console.log(`🏠 Local URL   : http://localhost:${config.port}`);
      }

      console.log('========================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
