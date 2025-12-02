import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "../constants.js";

dotenv.config({ path: "./.env" });

// Dynamic imports to ensure env vars are loaded BEFORE these files are read
const { bulkIndexVideos } = await import("../services/videoIndexer.js");
const { default: Video } = await import("../models/video.model.js");

const syncPinecone = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI.includes(DB_NAME)
            ? process.env.MONGODB_URI
            : `${process.env.MONGODB_URI}/${DB_NAME}`;

        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB");

        // Fetch all videos
        const videos = await Video.find({ isPublished: true });
        console.log(`📹 Found ${videos.length} videos in MongoDB.`);

        if (videos.length === 0) {
            console.log("⚠️ No videos found to sync.");
            process.exit(0);
        }

        // Sync to Pinecone
        console.log("🌲 Starting sync to Pinecone...");
        const videoIds = videos.map(v => v._id);

        // Process in chunks of 50 to avoid timeouts/limits
        const chunkSize = 50;
        for (let i = 0; i < videoIds.length; i += chunkSize) {
            const chunk = videoIds.slice(i, i + chunkSize);
            console.log(`   Processing chunk ${i / chunkSize + 1}/${Math.ceil(videoIds.length / chunkSize)}...`);
            await bulkIndexVideos(chunk);
        }

        console.log("✅ Sync Complete! Pinecone is now ready.");
        process.exit(0);

    } catch (error) {
        console.error("❌ Sync Failed:", error);
        process.exit(1);
    }
};

syncPinecone();
