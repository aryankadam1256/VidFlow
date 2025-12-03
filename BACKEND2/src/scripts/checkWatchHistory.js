import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import { DB_NAME } from "../constants.js";

dotenv.config({ path: "./.env" });

const checkWatchHistory = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI.includes(DB_NAME)
            ? process.env.MONGODB_URI
            : `${process.env.MONGODB_URI}/${DB_NAME}`;
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB");

        const user = await User.findOne({ username: "demo_user1" });
        if (user) {
            console.log(`\nUser: ${user.username}`);
            console.log(`Watch history length: ${user.watchHistory?.length || 0}`);
            if (user.watchHistory && user.watchHistory.length > 0) {
                console.log(`First 10 watched videos: ${user.watchHistory.slice(0, 10).join(", ")}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

checkWatchHistory();
