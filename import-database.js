const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Railway MongoDB URI - Replace with your Railway MongoDB URL
const RAILWAY_MONGODB_URI = process.env.MONGODB_URI || 'YOUR_RAILWAY_MONGODB_URL_HERE';

async function importDatabase() {
    try {
        // Read backup file
        const backupPath = path.join(__dirname, 'database-backup', 'full-backup.json');
        
        if (!fs.existsSync(backupPath)) {
            console.log('❌ Backup file not found at:', backupPath);
            console.log('Run "node export-database.js" first to create backup');
            return;
        }

        const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        
        console.log('Connecting to Railway MongoDB...');
        await mongoose.connect(RAILWAY_MONGODB_URI);
        console.log('✅ Connected to Railway MongoDB');

        const db = mongoose.connection.db;

        // Import each collection
        for (const [collectionName, documents] of Object.entries(backup)) {
            if (documents.length > 0) {
                // Drop existing collection
                try {
                    await db.collection(collectionName).drop();
                } catch (e) {
                    // Collection might not exist
                }
                
                // Insert documents
                await db.collection(collectionName).insertMany(documents);
                console.log(`✅ Imported ${collectionName}: ${documents.length} documents`);
            }
        }

        console.log('\n🎉 Database import complete!');
        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

importDatabase();
