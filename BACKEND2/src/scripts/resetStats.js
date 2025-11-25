import mongoose from "mongoose";
import dotenv from "dotenv";
import Video from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import User from "../models/user.model.js";
import { DB_NAME } from "../constants.js";
import { bulkIndexVideos } from "../services/videoIndexer.js";

dotenv.config({ path: "./.env" });

const resetStats = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI.includes(DB_NAME)
            ? process.env.MONGODB_URI
            : `${process.env.MONGODB_URI}/${DB_NAME}`;
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB");

        // Reset video views to 0
        const videoUpdateResult = await Video.updateMany(
            {},
            { $set: { views: 0 } }
        );
        console.log(`✅ Reset views for ${videoUpdateResult.modifiedCount} videos`);

        // Delete all likes
        const likeDeleteResult = await Like.deleteMany({});
        console.log(`✅ Deleted ${likeDeleteResult.deletedCount} likes`);

        // Delete all comments
        const commentDeleteResult = await Comment.deleteMany({});
        console.log(`✅ Deleted ${commentDeleteResult.deletedCount} comments`);

        // Clear watch history for all users
        const userUpdateResult = await User.updateMany(
            {},
            { $set: { watchHistory: [] } }
        );
        console.log(`✅ Cleared watch history for ${userUpdateResult.modifiedCount} users`);

        // Reindex videos in Elasticsearch
        try {
            const videos = await Video.find({}).select("_id");
            await bulkIndexVideos(videos.map((v) => v._id));
            console.log("🔁 Reindexed videos in Elasticsearch");
        } catch (error) {
            console.warn("⚠️  Failed to reindex videos:", error.message);
        }

        console.log("\n🎉 Stats reset complete!");
        console.log("\n📊 Summary:");
        console.log(`   - Videos: ${await Video.countDocuments()} (all with 0 views)`);
        console.log(`   - Likes: ${await Like.countDocuments()}`);
        console.log(`   - Comments: ${await Comment.countDocuments()}`);
        console.log(`   - Users with cleared history: ${userUpdateResult.modifiedCount}`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error resetting stats:", error);
        process.exit(1);
    }
};

resetStats();
