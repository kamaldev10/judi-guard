import app from '#app/app.js';
import connectDB from '#config/database.js';
import config from '#config/environment.js';

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(config.port, () => {
      const isProduction = process.env.NODE_ENV === 'production';

      console.log('========================================');

      if (isProduction) {
        console.log('🚀 Server started successfully!');
        console.log(`🌍 Environment : ${process.env.NODE_ENV}`);
        console.log(`🔌 Port        : ${config.port}`);

        if (config.apiUrl) {
          console.log(`🔗 URL         : ${process.env.apiUrl}`);
        }
      } else {
        console.log('🚀 Server started successfully!');
        console.log(`🌍 Environment : development`);
        console.log(`🏠 Local URL   : http://localhost:${config.port}`);
      }

      console.log('========================================');
    });

    // Graceful shutdown — close connections on deploy/restart
    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ Server closed.');
        process.exit(0);
      });
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
