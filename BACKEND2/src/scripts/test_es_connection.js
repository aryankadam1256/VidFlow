import dotenv from "dotenv";
import { Client } from "@elastic/elasticsearch";

dotenv.config({ path: "./.env" });

const testConnection = async () => {
    console.log("Testing Elasticsearch connection...");
    console.log("URL:", process.env.ELASTICSEARCH_URL);

    if (!process.env.ELASTICSEARCH_URL) {
        console.error("❌ ELASTICSEARCH_URL is not defined in .env");
        return;
    }

    const client = new Client({
        node: process.env.ELASTICSEARCH_URL,
        auth: process.env.ELASTICSEARCH_USERNAME
            ? {
                username: process.env.ELASTICSEARCH_USERNAME,
                password: process.env.ELASTICSEARCH_PASSWORD ?? "",
            }
            : undefined,
        tls: { rejectUnauthorized: false } // Assuming self-signed for dev
    });

    try {
        const info = await client.info();
        console.log("✅ Connected to Elasticsearch!");
        console.log("Version:", info.version.number);
    } catch (error) {
        console.error("❌ Connection failed:", error.message);
        if (error.meta && error.meta.body) {
            console.error("Response body:", error.meta.body);
        }
    }
};

testConnection();
