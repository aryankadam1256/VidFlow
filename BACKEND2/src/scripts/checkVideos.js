import mongoose from "mongoose";
import dotenv from "dotenv";
import Video from "../models/video.model.js";
import { DB_NAME } from "../constants.js";

dotenv.config({ path: "./.env" });

const checkVideos = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI.includes(DB_NAME)
            ? process.env.MONGODB_URI
            : `${process.env.MONGODB_URI}/${DB_NAME}`;
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB");

        const totalVideos = await Video.countDocuments();
        const publishedVideos = await Video.countDocuments({ isPublished: true });

        console.log(`\nTotal videos: ${totalVideos}`);
        console.log(`Published videos: ${publishedVideos}`);

        const videos = await Video.find({ isPublished: true }).select("title owner").limit(10);
        console.log("\nFirst 10 published videos:");
        videos.forEach((v, i) => {
            console.log(`  ${i + 1}. ${v.title}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

checkVideos();
