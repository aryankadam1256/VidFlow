// Quick diagnostic script to check Pinecone status
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const checkPineconeStatus = async () => {
    try {
        console.log('🔍 Checking Pinecone Configuration...\n');

        // Check environment variables
        console.log('Environment Variables:');
        console.log(`  PINECONE_API_KEY: ${process.env.PINECONE_API_KEY ? '✅ Set' : '❌ Missing'}`);
        console.log(`  PINECONE_INDEX: ${process.env.PINECONE_INDEX || '❌ Missing'}`);
        console.log(`  HF_API_KEY: ${process.env.HF_API_KEY ? '✅ Set' : '❌ Missing'}\n`);

        if (!process.env.PINECONE_API_KEY) {
            console.log('❌ Cannot proceed without PINECONE_API_KEY');
            process.exit(1);
        }

        // Import Pinecone client
        const { Pinecone } = await import('@pinecone-database/pinecone');
        const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

        const indexName = process.env.PINECONE_INDEX || 'vidflow';
        console.log(`📊 Connecting to index: ${indexName}...`);

        const index = pinecone.index(indexName);

        // Get index stats
        const stats = await index.describeIndexStats();

        console.log('\n✅ Pinecone Index Stats:');
        console.log(`  Total Vectors: ${stats.totalRecordCount || 0}`);
        console.log(`  Dimension: ${stats.dimension || 'Unknown'}`);
        console.log(`  Index Fullness: ${((stats.indexFullness || 0) * 100).toFixed(2)}%\n`);

        if (stats.totalRecordCount === 0) {
            console.log('⚠️  WARNING: Pinecone index is EMPTY!');
            console.log('   This is why recommendations are failing.');
            console.log('   You need to run: node src/scripts/syncPinecone.js\n');
        } else {
            console.log(`✅ Pinecone has ${stats.totalRecordCount} vectors`);
            console.log('   Recommendations should work!\n');
        }

        // Test a simple query
        if (stats.totalRecordCount > 0) {
            console.log('🧪 Testing a sample query...');
            const testVector = new Array(384).fill(0.1); // Dummy vector
            const queryResult = await index.query({
                vector: testVector,
                topK: 5,
                includeMetadata: true
            });

            console.log(`   Found ${queryResult.matches?.length || 0} results`);
            if (queryResult.matches && queryResult.matches.length > 0) {
                console.log('   Sample result:', queryResult.matches[0].metadata?.title || 'No title');
            }
        }

        console.log('\n✅ Pinecone check complete!');

    } catch (error) {
        console.error('\n❌ Error checking Pinecone:', error.message);
        if (error.message.includes('404')) {
            console.log('\n💡 The index might not exist. Create it in Pinecone dashboard:');
            console.log('   - Name: vidflow');
            console.log('   - Dimensions: 384');
            console.log('   - Metric: Cosine');
        }
    }
};

checkPineconeStatus();
