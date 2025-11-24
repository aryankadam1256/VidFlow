import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const listDbs = async () => {
    const uri = process.env.MONGODB_URI;
    console.log("Base URI:", uri);

    try {
        const conn = await mongoose.connect(uri);
        const admin = new mongoose.mongo.Admin(conn.connection.db);
        const dbs = await admin.listDatabases();
        console.log("Databases:", dbs.databases.map(d => d.name));

        // Check videotube specifically
        const db = conn.connection.useDb("videotube");
        const collections = await db.listCollections().toArray();
        console.log("Collections in 'videotube':", collections.map(c => c.name));

        const count = await db.collection("videos").countDocuments();
        console.log("Videos count in 'videotube':", count);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

listDbs();
