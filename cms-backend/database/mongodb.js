import mongoose from "mongoose";
import { DB_URI, NODE_ENV } from "../config/env.js";

if(!DB_URI) {
    throw new Error("DB_URI is not defined in environment variables");
}

const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        throw new Error(`MongoDB connection error: ${error.message}`);
    }
};

export default connectDB;