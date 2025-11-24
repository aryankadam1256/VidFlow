const HF_ENDPOINT =
  process.env.HF_EMBEDDING_MODEL ??
  "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";

const HF_API_KEY = process.env.HF_API_KEY;

const normalizeVector = (vector) => {
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  if (!norm) {
    return vector;
  }
  return vector.map((v) => v / norm);
};

export const generateEmbedding = async (inputText) => {
  if (!HF_API_KEY) {
    console.warn("HF_API_KEY not set, skipping embedding generation");
    return null;
  }

  if (HF_API_KEY.startsWith("hf_PLACEHOLDER")) {
    console.warn("HF_API_KEY is a placeholder, skipping embedding generation");
    return null;
  }

  try {
    const response = await fetch(HF_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: inputText }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Embedding request failed: ${errorText}`);
      return null;
    }

    const embedding = await response.json();

    if (!Array.isArray(embedding)) {
      console.error("Embedding response is not an array");
      return null;
    }

    // Hugging Face returns [1, dim] for some models, [dim] for others
    if (Array.isArray(embedding[0])) {
      return normalizeVector(embedding[0]);
    }
    return normalizeVector(embedding);
  } catch (error) {
    console.error("Error generating embedding:", error.message);
    return null;
  }
};

