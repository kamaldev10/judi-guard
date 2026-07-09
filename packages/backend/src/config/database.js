import config from '#config/environment.js';
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('MongoDB Connected successfully! 🎉');
  } catch (err) {
    console.error('MongoDB Connection Error 😟:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
