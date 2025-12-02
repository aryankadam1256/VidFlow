import { HfInference } from "@huggingface/inference";

const HF_API_KEY = process.env.HF_API_KEY;

let hf = null;
if (HF_API_KEY) {
    hf = new HfInference(HF_API_KEY);
}

export const generateEmbedding = async (text) => {
    if (!hf) {
        console.warn("⚠️ HF_API_KEY not found");
        return null;
    }

    try {
        // Clean text
        const cleanText = text.replace(/\n/g, " ").trim();

        const response = await hf.featureExtraction({
            model: "intfloat/e5-small-v2",
            inputs: cleanText,
        });

        // Response is the embedding array directly or nested
        if (Array.isArray(response)) {
            // If it's a single input, it might return [0.1, 0.2...] or [[0.1, 0.2...]]
            // The SDK usually returns the array directly for single input
            return Array.isArray(response[0]) ? response[0] : response;
        }
        return null;

    } catch (error) {
        console.error("❌ HF Embedding Error:", error.message);
        return null;
    }
};
