import mongoose from "mongoose";
import dotenv from "dotenv";
import Video from "../models/video.model.js";
import { DB_NAME } from "../constants.js";
import { bulkIndexVideos } from "../services/videoIndexer.js";

dotenv.config({ path: "./.env" });

const reindex = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI.includes(DB_NAME)
            ? process.env.MONGODB_URI
            : `${process.env.MONGODB_URI}/${DB_NAME}`;

        console.log("Connecting to DB:", DB_NAME);
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB");

        const videos = await Video.find({});
        console.log(`Found ${videos.length} videos to index.`);

        if (videos.length === 0) {
            console.log("No videos to index.");
            process.exit(0);
        }

        const videoIds = videos.map(v => v._id);

        console.log("Starting bulk index...");
        await bulkIndexVideos(videoIds);
        console.log("✅ Successfully indexed all videos to Elasticsearch");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error during reindexing:");
        console.error(error);
        if (error.meta && error.meta.body) {
            console.error("ES Error Body:", JSON.stringify(error.meta.body, null, 2));
        }
        process.exit(1);
    }
};

reindex();
