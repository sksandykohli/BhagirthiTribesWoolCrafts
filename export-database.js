const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function exportDatabase() {
    try {
        await mongoose.connect('mongodb://localhost:27017/bhagirthi-wool-crafts');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        const backupDir = path.join(__dirname, 'database-backup');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }

        const backup = {};
        
        for (const collection of collections) {
            const name = collection.name;
            const data = await db.collection(name).find({}).toArray();
            backup[name] = data;
            console.log(`Exported ${name}: ${data.length} documents`);
        }

        // Save as single JSON file
        const filename = path.join(backupDir, 'full-backup.json');
        fs.writeFileSync(filename, JSON.stringify(backup, null, 2));
        
        console.log('\n✅ Database exported to: database-backup/full-backup.json');
        console.log('\nCollections exported:');
        Object.keys(backup).forEach(name => {
            console.log(`  - ${name}: ${backup[name].length} documents`);
        });

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

exportDatabase();
