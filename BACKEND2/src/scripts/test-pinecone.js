import dotenv from "dotenv";

dotenv.config();

// Dynamic imports to ensure env vars are loaded BEFORE these files are read
const { index } = await import("../services/pineconeClient.js");
const { generateEmbedding } = await import("../services/hfService.js");

const testPinecone = async () => {
    console.log("🌲 Testing Pinecone Integration...");

    // 1. Test HF API
    console.log("🤖 Generating embedding for 'test query'...");
    const embedding = await generateEmbedding("test query");

    if (!embedding) {
        console.error("❌ Failed to generate embedding. Check HF_API_KEY.");
        return;
    }
    console.log("✅ Embedding generated successfully (Length: " + embedding.length + ")");

    // 2. Test Pinecone Connection
    if (!index) {
        console.error("❌ Pinecone index not initialized. Check PINECONE_API_KEY.");
        return;
    }

    try {
        console.log("🔍 Querying Pinecone...");
        const result = await index.query({
            vector: embedding,
            topK: 1,
            includeMetadata: true
        });
        console.log("✅ Pinecone Query Successful!");
        console.log("Results:", result);
    } catch (error) {
        console.error("❌ Pinecone Query Failed:", error.message);
    }
};

testPinecone();
