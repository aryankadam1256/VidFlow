import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const debugPinecone = async () => {
    console.log("🌲 Debugging Pinecone Connection...");

    if (!process.env.PINECONE_API_KEY) {
        console.error("❌ PINECONE_API_KEY is missing in .env");
        return;
    }

    try {
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

        console.log("🔍 Listing Indexes...");
        const indexes = await pc.listIndexes();

        console.log("✅ Indexes Found:", indexes);

        if (indexes.indexes && indexes.indexes.length > 0) {
            console.log("   - Index Name:", indexes.indexes[0].name);
            console.log("   - Host:", indexes.indexes[0].host);
            console.log("   - Status:", indexes.indexes[0].status);
        } else {
            console.warn("⚠️ No indexes found. Did you create one?");
        }

    } catch (error) {
        console.error("❌ Pinecone Error:", error);
    }
};

debugPinecone();
