import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import { DB_NAME } from "../constants.js";

dotenv.config({ path: "./.env" });

const clearWatchHistory = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI.includes(DB_NAME)
            ? process.env.MONGODB_URI
            : `${process.env.MONGODB_URI}/${DB_NAME}`;
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB");

        const result = await User.updateMany(
            { username: { $in: ["demo_user1", "demo_user2", "demo_user3"] } },
            { $set: { watchHistory: [] } }
        );

        console.log(`✅ Cleared watch history for ${result.modifiedCount} users`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

clearWatchHistory();
