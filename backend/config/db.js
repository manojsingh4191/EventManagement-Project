const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const connection = await mongoose.connect(process.env.MONGO_URI);
    if (process.env.NODE_ENV === 'production') {
      console.log('MongoDB connected');
    } else {
      console.log(`MongoDB connected: ${connection.connection.host}`);
    }
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
