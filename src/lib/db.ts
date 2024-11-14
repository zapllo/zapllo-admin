// lib/db.ts

import mongoose from 'mongoose';

async function connectDB() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}`, {});
    console.log(`MongoDB connected`);
  } catch (error) {
    console.error(`MongoDB connection error`, error);
    process.exit(1); // Exit process with failure
  }
}

export default connectDB;
