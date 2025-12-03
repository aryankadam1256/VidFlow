import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import { DB_NAME } from "../constants.js";

dotenv.config({ path: "./.env" });

const checkUser = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI.includes(DB_NAME)
            ? process.env.MONGODB_URI
            : `${process.env.MONGODB_URI}/${DB_NAME}`;
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB");

        const user = await User.findOne({ username: "demo_user1" });
        if (user) {
            console.log("✅ User found:");
            console.log("  Username:", user.username);
            console.log("  Email:", user.email);
            console.log("  Password hash:", user.password.substring(0, 20) + "...");

            // Test password
            const bcrypt = await import("bcrypt");
            const isMatch = await bcrypt.compare("password123", user.password);
            console.log("  Password 'password123' matches:", isMatch);
        } else {
            console.log("❌ User 'demo_user1' not found");
            console.log("\nAll users:");
            const allUsers = await User.find({}).select("username email");
            console.log(allUsers);
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

checkUser();
