import { Pinecone } from '@pinecone-database/pinecone';

const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX || 'videotube';

let pinecone = null;
let index = null;

if (apiKey) {
    try {
        pinecone = new Pinecone({
            apiKey: apiKey,
        });
        index = pinecone.index(indexName);
        console.log("🌲 Pinecone Client Initialized");
    } catch (error) {
        console.error("❌ Failed to initialize Pinecone:", error.message);
    }
} else {
    console.warn("⚠️ PINECONE_API_KEY not found in .env");
}

export { pinecone, index };
