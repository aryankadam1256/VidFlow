// Test script to verify which backend is being used for recommendations
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import mongoose from 'mongoose';
import User from '../models/user.model.js';
import { Pinecone } from '@pinecone-database/pinecone';

const testRecommendationSource = async () => {
    try {
        console.log('🧪 Testing Recommendation Source...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check Pinecone
        const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        const index = pinecone.index(process.env.PINECONE_INDEX || 'vidflow');
        const stats = await index.describeIndexStats();

        console.log('📊 Pinecone Status:');
        console.log(`   Vectors: ${stats.totalRecordCount}`);
        console.log(`   ${stats.totalRecordCount > 0 ? '✅ WILL USE PINECONE' : '❌ WILL USE MONGODB FALLBACK'}\n`);

        // Find a test user
        const user = await User.findOne({ username: 'demo_user1' });
        if (!user) {
            console.log('⚠️  No demo_user1 found. Create one first.');
            process.exit(0);
        }

        console.log(`👤 Testing with user: ${user.username}`);
        console.log(`   Watch History: ${user.watchHistory?.length || 0} videos\n`);

        // Simulate the recommendation logic
        if (stats.totalRecordCount > 0) {
            console.log('🎯 Recommendation Flow:');
            console.log('   1. ✅ Pinecone has vectors');

            if (user.watchHistory && user.watchHistory.length > 0) {
                console.log('   2. ✅ User has watch history');
                console.log('   3. 🌲 USING PINECONE for personalized recommendations');
            } else {
                console.log('   2. ⚠️  User has NO watch history');
                console.log('   3. 📊 USING MONGODB fallback (trending/popular videos)');
            }
        } else {
            console.log('🎯 Recommendation Flow:');
            console.log('   1. ❌ Pinecone is empty');
            console.log('   2. 📊 USING MONGODB fallback');
        }

        console.log('\n💡 To force Pinecone usage:');
        console.log('   - Ensure Pinecone has vectors (run syncPinecone.js)');
        console.log('   - User must have watch history (watch some videos)');

        await mongoose.disconnect();

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

testRecommendationSource();
