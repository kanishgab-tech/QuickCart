import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, Promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in the environment.");
  }

  if (!cached.Promise) {
    const opts = {
      dbName: "quickcart",
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,
    };

    cached.Promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.Promise;
  return cached.conn;
}

export default connectDB;