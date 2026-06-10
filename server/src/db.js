import mongoose from "mongoose";
import { config } from "./config.js";

export async function connectDatabase() {
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.warn(`MongoDB unavailable: ${error.message}`);
    console.warn("The API will still score applicants, but history will not be persisted.");
  }
}

export function databaseStatus() {
  return mongoose.connection.readyState === 1 ? "connected" : "disconnected";
}
