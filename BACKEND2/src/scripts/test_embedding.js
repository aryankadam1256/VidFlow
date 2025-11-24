import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

// Dynamic import to ensure env vars are loaded first
const { generateEmbedding } = await import("../services/embeddings.js");

const testEmbedding = async () => {
    console.log("Testing Embedding Generation...");
    console.log("API Key present:", !!process.env.HF_API_KEY);

    if (!process.env.HF_API_KEY || process.env.HF_API_KEY.startsWith("hf_PLACEHOLDER")) {
        console.error("❌ HF_API_KEY is missing or is a placeholder.");
        return;
    }

    try {
        const vector = await generateEmbedding("Hello world");
        if (vector && vector.length > 0) {
            console.log("✅ Embedding generated successfully!");
            console.log("Vector length:", vector.length);
        } else {
            console.error("❌ Embedding returned null or empty.");
        }
    } catch (e) {
        console.error("❌ Embedding generation failed:", e.message);
    }
};

testEmbedding();
