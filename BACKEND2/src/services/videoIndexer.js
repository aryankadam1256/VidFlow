import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import { index as pineconeIndex } from "./pineconeClient.js";
import { generateEmbedding } from "./hfService.js";

const VIDEO_INDEX = process.env.ELASTICSEARCH_VIDEO_INDEX || "videos";

const buildDocument = (videoDoc, owner) => {
  const base = {
    title: videoDoc.title,
    description: videoDoc.description,
    tags: videoDoc.tags ?? [],
    language: videoDoc.language ?? "en",
    views: videoDoc.views ?? 0,
    isPublished: videoDoc.isPublished ?? true,
    duration: videoDoc.duration ?? 0,
    thumbnail: videoDoc.thumbnail,
    videoFile: videoDoc.videoFile,
    publishedAt: videoDoc.publishedAt ?? videoDoc.createdAt,
    createdAt: videoDoc.createdAt,
    updatedAt: videoDoc.updatedAt,
    ownerId: videoDoc.owner?.toString(),
    ownerUsername: owner?.username,
    ownerFullname: owner?.fullname,
    ownerAvatar: owner?.avatar,
    transcriptUrl: videoDoc.transcriptUrl ?? null,
  };

  if (videoDoc.transcript) {
    base.transcript = videoDoc.transcript;
  }

  if (Array.isArray(videoDoc.embedding)) {
    base.embedding = videoDoc.embedding;
  }

  return base;
};

export const indexVideo = async (videoId) => {
  const video = await Video.findById(videoId);
  if (!video) return;

  const owner = await User.findById(video.owner).select("username fullname avatar");

  // 1. Generate Embedding (if missing)
  if (!Array.isArray(video.embedding) || video.embedding.length === 0) {
    const text = [video.title, video.description, (video.tags || []).join(" ")].join("\n");
    const embedding = await generateEmbedding(text);
    if (embedding) {
      video.embedding = embedding;
      await video.save();
    }
  }

  // 2. Index to Pinecone (if embedding exists)
  if (pineconeIndex && Array.isArray(video.embedding) && video.embedding.length > 0) {
    try {
      await pineconeIndex.upsert([{
        id: video._id.toString(),
        values: video.embedding,
        metadata: {
          title: video.title,
          isPublished: video.isPublished,
          ownerId: video.owner.toString(),
          tags: (video.tags || []).join(","), // Pinecone metadata supports strings/numbers/booleans/arrays of strings
          views: video.views
        }
      }]);
      console.log(`🌲 Indexed video ${videoId} to Pinecone`);
    } catch (err) {
      console.error("❌ Pinecone Index Error:", err.message);
    }
  }
};

export const removeVideo = async (videoId) => {
  if (pineconeIndex) {
    try {
      await pineconeIndex.deleteOne(videoId.toString());
      console.log(`🌲 Removed video ${videoId} from Pinecone`);
    } catch (err) {
      console.error("❌ Pinecone Delete Error:", err.message);
    }
  }
};

export const bulkIndexVideos = async (videoIds = []) => {
  const videos = await Video.find(
    videoIds.length ? { _id: { $in: videoIds } } : {}
  ).limit(100); // Pinecone batch limit is usually 100-200 vectors per request

  if (!videos.length) return;

  const vectors = [];

  for (const video of videos) {
    // Generate embedding if missing
    if (!Array.isArray(video.embedding) || video.embedding.length === 0) {
      const text = [video.title, video.description, (video.tags || []).join(" ")].join("\n");
      const embedding = await generateEmbedding(text);
      if (embedding) {
        video.embedding = embedding;
        await video.save();
      }
    }

    if (Array.isArray(video.embedding) && video.embedding.length > 0) {
      vectors.push({
        id: video._id.toString(),
        values: video.embedding,
        metadata: {
          title: video.title,
          isPublished: video.isPublished,
          ownerId: video.owner.toString(),
          tags: (video.tags || []).join(","),
          views: video.views
        }
      });
    }
  }

  if (vectors.length > 0 && pineconeIndex) {
    try {
      await pineconeIndex.upsert(vectors);
      console.log(`🌲 Bulk indexed ${vectors.length} videos to Pinecone`);
    } catch (err) {
      console.error("❌ Pinecone Bulk Index Error:", err.message);
    }
  }
};

